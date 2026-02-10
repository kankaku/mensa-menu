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

const getCachedTranslations = unstable_cache(
  async (
    cacheDateKey: string,
    language: TranslationTargetLanguage,
    namesKey: string,
  ): Promise<Record<string, string>> => {
    const names = JSON.parse(namesKey) as string[];
    const translations = await translateItemNames(names, language);

    if (names.length > 0 && Object.keys(translations).length === 0) {
      throw new Error(`Gemini returned no translations for ${cacheDateKey}`);
    }

    return withNameFallback(names, translations);
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
  const namesKey = JSON.stringify(normalizedNames);

  try {
    return await getCachedTranslations(cacheDateKey, language, namesKey);
  } catch (error) {
    console.error(
      `[Translation Cache] Data cache fallback for ${cacheDateKey} (${language})`,
      error,
    );
    const directTranslations = await translateItemNames(normalizedNames, language);
    return withNameFallback(normalizedNames, directTranslations);
  }
}

const getCachedDishExplanation = unstable_cache(
  async (dishName: string, language: AppLanguage): Promise<string> => {
    const explanation = await explainDish(dishName, language);

    if (explanation === EXPLANATION_FALLBACK_BY_LANGUAGE[language]) {
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
    return explainDish(normalizedDishName, language);
  }
}
