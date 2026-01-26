import { NextRequest, NextResponse } from "next/server";
import { translateItemNames } from "@/lib/gemini";
import {
  DailyMenu,
  MenuSection,
  MenuItem,
  SECTION_TRANSLATIONS,
} from "@/lib/types";
import {
  getCachedTranslations,
  setCachedTranslations,
  cleanupOldCache,
} from "@/lib/translation-cache";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const menu = body.menu as DailyMenu;

    if (!menu) {
      return NextResponse.json(
        { error: "Menu data is required" },
        { status: 400 },
      );
    }

    // Load existing cached translations
    const cachedTranslations = await getCachedTranslations();

    // Collect all item names and section names from the current menu
    const allItemNames: string[] = [];
    const allSectionNames: string[] = [];

    for (const section of menu.sections) {
      if (!SECTION_TRANSLATIONS[section.name]) {
        allSectionNames.push(section.name);
      }
      for (const item of section.items) {
        allItemNames.push(item.name);
      }
    }

    // Find names that are NOT in cache
    const uncachedItemNames = allItemNames.filter(
      (name) => !cachedTranslations[name],
    );
    const uncachedSectionNames = allSectionNames.filter(
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
        await setCachedTranslations(newTranslations);
      }
    } else {
      console.log(
        `[Translation] HIT - all ${allItemNames.length} items cached`,
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
          allItemNames.length - uncachedItemNames.length,
        ),
        "X-New-Items": String(uncachedItemNames.length),
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
