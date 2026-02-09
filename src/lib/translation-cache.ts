import fs from "fs/promises";
import path from "path";
import { AppLanguage, TranslationTargetLanguage } from "./types";

// Cache directory for storing translations
const CACHE_DIR = path.join(process.cwd(), ".translation-cache");

interface TranslationEntry {
  en?: string;
  ko?: string;
}

interface TranslationsCache {
  [germanName: string]: string | TranslationEntry;
}

type FlatTranslations = Record<string, string>;

function normalizeTranslations(
  cache: TranslationsCache,
  language: TranslationTargetLanguage,
): FlatTranslations {
  const normalized: FlatTranslations = {};

  for (const [germanName, translationValue] of Object.entries(cache)) {
    if (typeof translationValue === "string") {
      if (language === "en") {
        normalized[germanName] = translationValue;
      }
      continue;
    }

    const translatedName = translationValue?.[language];
    if (typeof translatedName === "string" && translatedName.length > 0) {
      normalized[germanName] = translatedName;
    }
  }

  return normalized;
}

interface ExplanationsCache {
  [germanName: string]: {
    en?: string;
    de?: string;
    ko?: string;
  };
}

/**
 * Get today's date as YYYY-MM-DD
 */
function getTodayKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

/**
 * Resolve a safe cache date key.
 * Falls back to today's key when input is missing/invalid.
 */
function resolveDateKey(dateKey?: string): string {
  if (typeof dateKey === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
    return dateKey;
  }
  return getTodayKey();
}

/**
 * Ensure the cache directory for a specific date exists
 */
async function ensureDateDir(dateKey: string): Promise<string> {
  const dateDir = path.join(CACHE_DIR, dateKey);
  try {
    await fs.access(dateDir);
  } catch {
    await fs.mkdir(dateDir, { recursive: true });
  }
  return dateDir;
}

/**
 * Get cached translations for today
 * Returns a map of { germanName: englishName }
 */
export async function getCachedTranslations(): Promise<FlatTranslations> {
  return getCachedTranslationsForDate(undefined, "en");
}

/**
 * Get cached translations for a specific menu date (YYYY-MM-DD).
 * Falls back to today's cache when no valid date is provided.
 */
export async function getCachedTranslationsForDate(
  dateKey?: string,
  language: TranslationTargetLanguage = "en",
): Promise<FlatTranslations> {
  try {
    const cacheDateKey = resolveDateKey(dateKey);
    const dateDir = await ensureDateDir(cacheDateKey);
    const filePath = path.join(dateDir, "translations.json");

    const content = await fs.readFile(filePath, "utf-8");
    const cache = JSON.parse(content) as TranslationsCache;
    const normalized = normalizeTranslations(cache, language);
    console.log(
      `[Translation Cache] Loaded ${Object.keys(normalized).length} cached ${language} translations for ${cacheDateKey}`,
    );
    return normalized;
  } catch {
    return {};
  }
}

/**
 * Save translations to cache (merges with existing)
 */
export async function setCachedTranslations(
  newTranslations: FlatTranslations,
): Promise<void> {
  await setCachedTranslationsForDate(newTranslations, undefined, "en");
}

/**
 * Save translations to cache for a specific menu date (YYYY-MM-DD).
 * Falls back to today's cache when no valid date is provided.
 */
export async function setCachedTranslationsForDate(
  newTranslations: FlatTranslations,
  dateKey?: string,
  language: TranslationTargetLanguage = "en",
): Promise<void> {
  try {
    const cacheDateKey = resolveDateKey(dateKey);
    const dateDir = await ensureDateDir(cacheDateKey);
    const filePath = path.join(dateDir, "translations.json");

    let existing: TranslationsCache = {};
    try {
      const content = await fs.readFile(filePath, "utf-8");
      existing = JSON.parse(content) as TranslationsCache;
    } catch {
      // File doesn't exist yet
    }

    for (const [germanName, translatedName] of Object.entries(newTranslations)) {
      const existingValue = existing[germanName];
      const entry: TranslationEntry =
        typeof existingValue === "string" ? { en: existingValue } : existingValue || {};
      entry[language] = translatedName;
      existing[germanName] = entry;
    }

    await fs.writeFile(filePath, JSON.stringify(existing, null, 2));
    const normalized = normalizeTranslations(existing, language);
    console.log(
      `[Translation Cache] Saved ${Object.keys(newTranslations).length} new ${language} translations for ${cacheDateKey} (total: ${Object.keys(normalized).length})`,
    );
  } catch (error) {
    console.error("[Translation Cache] Failed to save translations:", error);
  }
}

/**
 * Get a cached explanation for a dish
 */
export async function getCachedExplanation(
  dishName: string,
  language: AppLanguage,
): Promise<string | null> {
  try {
    const dateKey = getTodayKey();
    const dateDir = path.join(CACHE_DIR, dateKey);
    const filePath = path.join(dateDir, "explanations.json");

    const content = await fs.readFile(filePath, "utf-8");
    const cache = JSON.parse(content) as ExplanationsCache;

    const explanation = cache[dishName]?.[language];
    if (explanation) {
      console.log(`[Explanation Cache] HIT for "${dishName}" (${language})`);
      return explanation;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Save an explanation to cache
 */
export async function setCachedExplanation(
  dishName: string,
  language: AppLanguage,
  explanation: string,
): Promise<void> {
  try {
    const dateKey = getTodayKey();
    const dateDir = await ensureDateDir(dateKey);
    const filePath = path.join(dateDir, "explanations.json");

    // Load existing
    let cache: ExplanationsCache = {};
    try {
      const content = await fs.readFile(filePath, "utf-8");
      cache = JSON.parse(content) as ExplanationsCache;
    } catch {
      // File doesn't exist yet
    }

    // Merge
    if (!cache[dishName]) {
      cache[dishName] = {};
    }
    cache[dishName][language] = explanation;

    await fs.writeFile(filePath, JSON.stringify(cache, null, 2));
    console.log(`[Explanation Cache] Saved "${dishName}" (${language})`);
  } catch (error) {
    console.error("[Explanation Cache] Failed to save:", error);
  }
}

/**
 * Clean up old cache directories (older than 7 days)
 */
export async function cleanupOldCache(): Promise<void> {
  try {
    await fs.access(CACHE_DIR);
    const dirs = await fs.readdir(CACHE_DIR);
    const now = new Date();

    for (const dir of dirs) {
      // Expect format YYYY-MM-DD
      const dateMatch = dir.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (!dateMatch) continue;

      const dirDate = new Date(
        parseInt(dateMatch[1]),
        parseInt(dateMatch[2]) - 1,
        parseInt(dateMatch[3]),
      );

      const ageInDays =
        (now.getTime() - dirDate.getTime()) / (1000 * 60 * 60 * 24);

      if (ageInDays > 7) {
        const dirPath = path.join(CACHE_DIR, dir);
        await fs.rm(dirPath, { recursive: true });
        console.log(`[Cache Cleanup] Deleted old cache: ${dir}`);
      }
    }
  } catch (error) {
    console.error("[Cache Cleanup] Error:", error);
  }
}
