import { NextRequest, NextResponse } from "next/server";
import {
  DailyMenu,
  MenuSection,
  MenuItem,
  MENSA_NAME_TRANSLATIONS,
  SECTION_TRANSLATIONS_EN,
  SECTION_TRANSLATIONS_KO,
  TranslationTargetLanguage,
} from "@/lib/types";
import { getTranslationsForMenu } from "@/lib/server-cache";

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
    const rawLanguage = isRecord(body) ? body.language : undefined;
    const language: TranslationTargetLanguage =
      rawLanguage === "ko" ? "ko" : "en";

    if (!isDailyMenu(menu)) {
      return NextResponse.json(
        { error: "Menu data is required and must be valid" },
        { status: 400 },
      );
    }
    if (
      rawLanguage !== undefined &&
      rawLanguage !== "en" &&
      rawLanguage !== "ko"
    ) {
      return NextResponse.json(
        { error: "Language must be 'en' or 'ko'" },
        { status: 400 },
      );
    }

    const cacheDateKey = menu.date;

    const sectionTranslationMap =
      language === "ko" ? SECTION_TRANSLATIONS_KO : SECTION_TRANSLATIONS_EN;

    // Collect all item names and section names from the current menu
    const allItemNames = new Set<string>();
    const allSectionNames = new Set<string>();

    for (const section of menu.sections) {
      if (!sectionTranslationMap[section.name]) {
        allSectionNames.add(section.name);
      }
      for (const item of section.items) {
        allItemNames.add(item.name);
      }
    }

    const uniqueItemNames = [...allItemNames];
    const uniqueSectionNames = [...allSectionNames];
    const namesToTranslate = [...uniqueItemNames, ...uniqueSectionNames];

    const allTranslations = await getTranslationsForMenu(
      namesToTranslate,
      cacheDateKey,
      language,
    );

    // Apply translations to the menu
    const translatedMenu = applyTranslations(menu, allTranslations, language);

    return NextResponse.json(translatedMenu, {
      headers: {
        "X-Cache": "DATA-CACHE",
        "X-Cache-Date": cacheDateKey,
        "X-Language": language,
        "X-Translated-Items": String(uniqueItemNames.length),
        "X-Translated-Names": String(namesToTranslate.length),
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
  language: TranslationTargetLanguage,
): DailyMenu {
  const sectionTranslationMap =
    language === "ko" ? SECTION_TRANSLATIONS_KO : SECTION_TRANSLATIONS_EN;

  const translatedSections: MenuSection[] = menu.sections.map((section) => {
    const translatedItems: MenuItem[] = section.items.map((item) => ({
      ...item,
      ...(language === "en"
        ? { nameEn: translations[item.name] || item.name }
        : { nameKo: translations[item.name] || item.name }),
    }));

    return {
      ...section,
      ...(language === "en"
        ? {
            nameEn:
              sectionTranslationMap[section.name] ||
              translations[section.name] ||
              section.name,
          }
        : {
            nameKo:
              sectionTranslationMap[section.name] ||
              translations[section.name] ||
              section.name,
          }),
      items: translatedItems,
    };
  });

  return {
    ...menu,
    ...(language === "en"
      ? { mensaNameEn: MENSA_NAME_TRANSLATIONS.en }
      : { mensaNameKo: MENSA_NAME_TRANSLATIONS.ko }),
    sections: translatedSections,
  };
}
