import { unstable_cache } from "next/cache";
import { explainDish, translateItemNames } from "./gemini";
import { AppLanguage, TranslationTargetLanguage } from "./types";

const TRANSLATION_REVALIDATE_SECONDS = 60 * 60 * 24 * 7; // 7 days
const EXPLANATION_REVALIDATE_SECONDS = 60 * 60 * 24 * 14; // 14 days
const TRANSLATION_CACHE_CONCURRENCY = 6;
const TRANSLATION_CACHE_MISS = "TRANSLATION_CACHE_MISS";

const EXPLANATION_FALLBACK_BY_LANGUAGE: Record<AppLanguage, string> = {
  en: "Unable to generate explanation at this time.",
  de: "Die Erklärung konnte nicht generiert werden.",
  ko: "지금은 설명을 생성할 수 없습니다.",
};
const EMPTY_EXPLANATION_FALLBACK = "Unable to generate explanation.";
const translationSeedStore = new Map<string, string>();

function getTodayKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function resolveDateKey(dateKey?: string): string {
  if (typeof dateKey === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
    return dateKey;
  }
  return getTodayKey();
}

function normalizeNames(names: string[]): string[] {
  return [...new Set(names.map((name) => name.trim()).filter(Boolean))].sort();
}

function withNameFallback(
  names: string[],
  translations: Record<string, string>,
): Record<string, string> {
  const merged: Record<string, string> = {};

  for (const name of names) {
    merged[name] = translations[name] || name;
  }

  return merged;
}

function isValidTranslation(value: string | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isCacheableExplanation(
  explanation: string,
  language: AppLanguage,
): boolean {
  const text = explanation.trim();
  if (!text) {
    return false;
  }

  if (text === EMPTY_EXPLANATION_FALLBACK) {
    return false;
  }

  return !Object.values(EXPLANATION_FALLBACK_BY_LANGUAGE).includes(text) &&
    text !== EXPLANATION_FALLBACK_BY_LANGUAGE[language];
}

async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  mapper: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;

  async function worker() {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await mapper(items[index]);
    }
  }

  const workers = Array.from(
    { length: Math.min(limit, items.length) },
    () => worker(),
  );
  await Promise.all(workers);

  return results;
}

function getTranslationSeedKey(
  cacheDateKey: string,
  language: TranslationTargetLanguage,
  germanName: string,
): string {
  return `${cacheDateKey}|${language}|${germanName}`;
}

const getCachedTranslationForName = unstable_cache(
  async (
    cacheDateKey: string,
    language: TranslationTargetLanguage,
    germanName: string,
  ): Promise<string> => {
    const seedKey = getTranslationSeedKey(cacheDateKey, language, germanName);
    const translated = translationSeedStore.get(seedKey);

    if (!isValidTranslation(translated)) {
      throw new Error(TRANSLATION_CACHE_MISS);
    }

    return translated.trim();
  },
  ["menu-item-translation-v4"],
  { revalidate: TRANSLATION_REVALIDATE_SECONDS },
);

export async function getTranslationsForMenu(
  names: string[],
  dateKey: string | undefined,
  language: TranslationTargetLanguage,
): Promise<Record<string, string>> {
  const normalizedNames = normalizeNames(names);
  if (normalizedNames.length === 0) {
    return {};
  }

  const cacheDateKey = resolveDateKey(dateKey);
  const cacheEntries = await mapWithConcurrency(
    normalizedNames,
    TRANSLATION_CACHE_CONCURRENCY,
    async (name) => {
      try {
        const translated = await getCachedTranslationForName(
          cacheDateKey,
          language,
          name,
        );
        return [name, translated] as const;
      } catch {
        return [name, null] as const;
      }
    },
  );

  const resolvedTranslations: Record<string, string> = {};
  const missingNames: string[] = [];
  for (const [name, translated] of cacheEntries) {
    if (translated) {
      resolvedTranslations[name] = translated;
    } else {
      missingNames.push(name);
    }
  }

  if (missingNames.length > 0) {
    const batchedTranslations = await translateItemNames(missingNames, language);
    const seededNames: string[] = [];

    for (const name of missingNames) {
      const translated = batchedTranslations[name];
      if (!isValidTranslation(translated)) {
        continue;
      }

      const normalized = translated.trim();
      resolvedTranslations[name] = normalized;
      translationSeedStore.set(
        getTranslationSeedKey(cacheDateKey, language, name),
        normalized,
      );
      seededNames.push(name);
    }

    try {
      await mapWithConcurrency(
        seededNames,
        TRANSLATION_CACHE_CONCURRENCY,
        async (name) => {
          try {
            await getCachedTranslationForName(cacheDateKey, language, name);
          } catch {
            // Best effort warm-up; response already has direct translations.
          }
        },
      );
    } finally {
      for (const name of seededNames) {
        translationSeedStore.delete(
          getTranslationSeedKey(cacheDateKey, language, name),
        );
      }
    }
  }

  return withNameFallback(normalizedNames, resolvedTranslations);
}

const getCachedDishExplanation = unstable_cache(
  async (dishName: string, language: AppLanguage): Promise<string> => {
    const explanation = await explainDish(dishName, language);

    if (!isCacheableExplanation(explanation, language)) {
      throw new Error("Gemini returned fallback explanation");
    }

    return explanation;
  },
  ["dish-explanations-v2"],
  { revalidate: EXPLANATION_REVALIDATE_SECONDS },
);

export async function getExplanationForDish(
  dishName: string,
  language: AppLanguage,
): Promise<string> {
  const normalizedDishName = dishName.trim();
  if (!normalizedDishName) {
    return EXPLANATION_FALLBACK_BY_LANGUAGE[language];
  }

  try {
    return await getCachedDishExplanation(normalizedDishName, language);
  } catch (error) {
    console.error(
      `[Explanation Cache] Data cache fallback for "${normalizedDishName}" (${language})`,
      error,
    );

    try {
      const directExplanation = await explainDish(normalizedDishName, language);
      if (isCacheableExplanation(directExplanation, language)) {
        return directExplanation;
      }
    } catch (directError) {
      console.error(
        `[Explanation Cache] Direct explain fallback failed for "${normalizedDishName}" (${language})`,
        directError,
      );
    }

    return EXPLANATION_FALLBACK_BY_LANGUAGE[language];
  }
}
