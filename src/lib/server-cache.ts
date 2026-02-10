import { unstable_cache } from "next/cache";
import { explainDish, translateItemNames } from "./gemini";
import { AppLanguage, TranslationTargetLanguage } from "./types";

const TRANSLATION_REVALIDATE_SECONDS = 60 * 60 * 24 * 7; // 7 days
const EXPLANATION_REVALIDATE_SECONDS = 60 * 60 * 24 * 14; // 14 days

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

function pickValidTranslations(
  names: string[],
  translations: Record<string, string>,
): Record<string, string> {
  const valid: Record<string, string> = {};

  for (const name of names) {
    const translated = translations[name];
    if (typeof translated === "string" && translated.trim().length > 0) {
      valid[name] = translated;
    }
  }

  return valid;
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

const getCachedTranslations = unstable_cache(
  async (
    cacheDateKey: string,
    language: TranslationTargetLanguage,
    namesKey: string,
  ): Promise<Record<string, string>> => {
    const names = JSON.parse(namesKey) as string[];
    const rawTranslations = await translateItemNames(names, language);
    const translations = pickValidTranslations(names, rawTranslations);

    if (names.length > 0 && Object.keys(translations).length === 0) {
      throw new Error(
        `Gemini returned no translations for ${cacheDateKey} (${language})`,
      );
    }

    return translations;
  },
  ["menu-item-translations-v2"],
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
  const resolvedTranslations: Record<string, string> = {};
  let remainingNames = [...normalizedNames];

  // Progressively load cached subsets so partial Gemini results can still warm cache.
  // This avoids throwing away successful entries when one or two names are missing.
  for (let attempt = 0; attempt < 3 && remainingNames.length > 0; attempt += 1) {
    try {
      const cachedTranslations = await getCachedTranslations(
        cacheDateKey,
        language,
        JSON.stringify(remainingNames),
      );
      Object.assign(resolvedTranslations, cachedTranslations);

      const unresolved = remainingNames.filter((name) => !resolvedTranslations[name]);
      if (unresolved.length === remainingNames.length) {
        break;
      }
      remainingNames = unresolved;
    } catch (error) {
      console.error(
        `[Translation Cache] Data cache miss for ${cacheDateKey} (${language})`,
        error,
      );
      break;
    }
  }

  if (remainingNames.length > 0) {
    const directTranslations = await translateItemNames(remainingNames, language);
    const validDirectTranslations = pickValidTranslations(
      remainingNames,
      directTranslations,
    );
    Object.assign(resolvedTranslations, validDirectTranslations);
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
