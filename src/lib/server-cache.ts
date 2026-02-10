import { unstable_cache } from "next/cache";
import { explainDish, translateItemNames } from "./gemini";
import { AppLanguage, TranslationTargetLanguage } from "./types";

const TRANSLATION_REVALIDATE_SECONDS = 60 * 60 * 24 * 7; // 7 days
const EXPLANATION_REVALIDATE_SECONDS = 60 * 60 * 24 * 14; // 14 days
const TRANSLATION_CACHE_CONCURRENCY = 6;

const EXPLANATION_FALLBACK_BY_LANGUAGE: Record<AppLanguage, string> = {
  en: "Unable to generate explanation at this time.",
  de: "Die Erklärung konnte nicht generiert werden.",
  ko: "지금은 설명을 생성할 수 없습니다.",
};
const EMPTY_EXPLANATION_FALLBACK = "Unable to generate explanation.";

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

const getCachedTranslationForName = unstable_cache(
  async (
    cacheDateKey: string,
    language: TranslationTargetLanguage,
    germanName: string,
  ): Promise<string> => {
    const rawTranslations = await translateItemNames([germanName], language);
    const translated = rawTranslations[germanName];

    if (typeof translated !== "string" || translated.trim().length === 0) {
      throw new Error(
        `Gemini returned no translation for "${germanName}" on ${cacheDateKey} (${language})`,
      );
    }

    return translated.trim();
  },
  ["menu-item-translation-v3"],
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
  const resolvedEntries = await mapWithConcurrency(
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
  for (const [name, translated] of resolvedEntries) {
    if (translated) {
      resolvedTranslations[name] = translated;
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
    return EXPLANATION_FALLBACK_BY_LANGUAGE[language];
  }
}
