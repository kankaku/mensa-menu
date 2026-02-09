import { NextRequest, NextResponse } from "next/server";
import { translateItemNames } from "@/lib/gemini";
import {
  DailyMenu,
  MenuSection,
  MenuItem,
  SECTION_TRANSLATIONS,
} from "@/lib/types";
import {
  getCachedTranslationsForDate,
  setCachedTranslationsForDate,
  cleanupOldCache,
} from "@/lib/translation-cache";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isDailyMenu(value: unknown): value is DailyMenu {
  if (!isRecord(value) || !Array.isArray(value.sections)) {
    return false;
  }

  return value.sections.every(
    (section) =>
      isRecord(section) &&
      typeof section.name === "string" &&
      Array.isArray(section.items) &&
      section.items.every((item) => isRecord(item) && typeof item.name === "string"),
  );
}

export async function POST(request: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const menu = isRecord(body) ? body.menu : undefined;

    if (!isDailyMenu(menu)) {
      return NextResponse.json(
        { error: "Menu data is required and must be valid" },
        { status: 400 },
      );
    }

    const cacheDateKey = menu.date;

    // Load existing cached translations for this menu day.
    const cachedTranslations = await getCachedTranslationsForDate(cacheDateKey);

    // Collect all item names and section names from the current menu
    const allItemNames = new Set<string>();
    const allSectionNames = new Set<string>();

    for (const section of menu.sections) {
      if (!SECTION_TRANSLATIONS[section.name]) {
        allSectionNames.add(section.name);
      }
      for (const item of section.items) {
        allItemNames.add(item.name);
      }
    }

    const uniqueItemNames = [...allItemNames];
    const uniqueSectionNames = [...allSectionNames];

    // Find names that are NOT in cache
    const uncachedItemNames = uniqueItemNames.filter(
      (name) => !cachedTranslations[name],
    );
    const uncachedSectionNames = uniqueSectionNames.filter(
      (name) => !cachedTranslations[name],
    );
    const uncachedNames = [...uncachedItemNames, ...uncachedSectionNames];

    let newTranslations: Record<string, string> = {};
    let cacheStatus = "HIT";

    // Only call Gemini API if there are uncached items
    if (uncachedNames.length > 0) {
      console.log(
        `[Translation] MISS - translating ${uncachedNames.length} items via Gemini API`,
      );
      cacheStatus = "PARTIAL";

      newTranslations = await translateItemNames(uncachedNames);

      // Save new translations to cache
      if (Object.keys(newTranslations).length > 0) {
        await setCachedTranslationsForDate(newTranslations, cacheDateKey);
      }
    } else {
      console.log(
        `[Translation] HIT - all ${uniqueItemNames.length} items cached`,
      );
    }

    // Merge cached + new translations
    const allTranslations = { ...cachedTranslations, ...newTranslations };

    // Apply translations to the menu
    const translatedMenu = applyTranslations(menu, allTranslations);

    // Cleanup old cache files in the background
    cleanupOldCache().catch(console.error);

    return NextResponse.json(translatedMenu, {
      headers: {
        "X-Cache": cacheStatus,
        "X-Cached-Items": String(
          uniqueItemNames.length - uncachedItemNames.length,
        ),
        "X-New-Items": String(uncachedItemNames.length),
        "X-New-Names": String(uncachedNames.length),
        "X-Cache-Date": cacheDateKey,
      },
    });
  } catch (error) {
    console.error("Translation error:", error);
    return NextResponse.json(
      { error: "Failed to translate menu" },
      { status: 500 },
    );
  }
}

/**
 * Apply translations to a DailyMenu
 */
function applyTranslations(
  menu: DailyMenu,
  translations: Record<string, string>,
): DailyMenu {
  const translatedSections: MenuSection[] = menu.sections.map((section) => {
    const translatedItems: MenuItem[] = section.items.map((item) => ({
      ...item,
      nameEn: translations[item.name] || item.name,
    }));

    return {
      ...section,
      nameEn:
        SECTION_TRANSLATIONS[section.name] ||
        translations[section.name] ||
        section.name,
      items: translatedItems,
    };
  });

  return {
    ...menu,
    mensaNameEn: "Mensa South",
    sections: translatedSections,
  };
}
