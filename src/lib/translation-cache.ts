import fs from "fs/promises";
import path from "path";
import { DailyMenu } from "./types";

// Cache directory for storing translations
const CACHE_DIR = path.join(process.cwd(), ".translation-cache");

/**
 * Get or create the cache directory
 */
async function ensureCacheDir(): Promise<void> {
  try {
    await fs.access(CACHE_DIR);
  } catch {
    await fs.mkdir(CACHE_DIR, { recursive: true });
  }
}

/**
 * Generate a cache key based on the date
 * Format: YYYY-MM-DD
 */
function getCacheKey(menu: DailyMenu): string {
  // Extract date from menu or use current date
  const dateMatch = menu.date.match(/(\d{2})\.(\d{2})\.(\d{4})/);
  if (dateMatch) {
    // German date format DD.MM.YYYY -> YYYY-MM-DD
    return `${dateMatch[3]}-${dateMatch[2]}-${dateMatch[1]}`;
  }

  // Fallback to current date
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
    2,
    "0",
  )}-${String(now.getDate()).padStart(2, "0")}`;
}

/**
 * Get the cache file path for a given date
 */
function getCacheFilePath(cacheKey: string): string {
  return path.join(CACHE_DIR, `menu-${cacheKey}.json`);
}

/**
 * Try to get a cached translation for the given menu date
 */
export async function getCachedTranslation(
  menu: DailyMenu,
): Promise<DailyMenu | null> {
  try {
    await ensureCacheDir();
    const cacheKey = getCacheKey(menu);
    const cacheFile = getCacheFilePath(cacheKey);

    const cached = await fs.readFile(cacheFile, "utf-8");
    const cachedMenu = JSON.parse(cached) as DailyMenu;

    console.log(`[Translation Cache] HIT for date: ${cacheKey}`);
    return cachedMenu;
  } catch {
    // Cache miss or error reading cache
    return null;
  }
}

/**
 * Save a translation to the cache
 */
export async function setCachedTranslation(
  originalMenu: DailyMenu,
  translatedMenu: DailyMenu,
): Promise<void> {
  try {
    await ensureCacheDir();
    const cacheKey = getCacheKey(originalMenu);
    const cacheFile = getCacheFilePath(cacheKey);

    await fs.writeFile(cacheFile, JSON.stringify(translatedMenu, null, 2));
    console.log(`[Translation Cache] SAVED for date: ${cacheKey}`);
  } catch (error) {
    console.error("[Translation Cache] Failed to save cache:", error);
  }
}

/**
 * Clean up old cache files (older than 7 days)
 */
export async function cleanupOldCache(): Promise<void> {
  try {
    await ensureCacheDir();
    const files = await fs.readdir(CACHE_DIR);
    const now = new Date();

    for (const file of files) {
      if (!file.startsWith("menu-") || !file.endsWith(".json")) continue;

      // Extract date from filename (menu-YYYY-MM-DD.json)
      const dateMatch = file.match(/menu-(\d{4})-(\d{2})-(\d{2})\.json/);
      if (!dateMatch) continue;

      const fileDate = new Date(
        parseInt(dateMatch[1]),
        parseInt(dateMatch[2]) - 1,
        parseInt(dateMatch[3]),
      );

      const ageInDays =
        (now.getTime() - fileDate.getTime()) / (1000 * 60 * 60 * 24);

      if (ageInDays > 7) {
        const filePath = path.join(CACHE_DIR, file);
        await fs.unlink(filePath);
        console.log(`[Translation Cache] Deleted old cache: ${file}`);
      }
    }
  } catch (error) {
    console.error("[Translation Cache] Cleanup error:", error);
  }
}
