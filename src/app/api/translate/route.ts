import { NextRequest, NextResponse } from "next/server";
import {
  DailyMenu,
  MenuSection,
  MenuItem,
  MENSA_NAME_TRANSLATIONS,
  SECTION_TRANSLATIONS_EN,
  SECTION_TRANSLATIONS_JA,
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

function getSectionTranslationMap(
  language: TranslationTargetLanguage,
): Record<string, string> {
  switch (language) {
    case "ko":
      return SECTION_TRANSLATIONS_KO;
    case "ja":
      return SECTION_TRANSLATIONS_JA;
    case "en":
    default:
      return SECTION_TRANSLATIONS_EN;
  }
}

function applyItemTranslation(
  item: MenuItem,
  translatedName: string,
  language: TranslationTargetLanguage,
): MenuItem {
  switch (language) {
    case "ko":
      return { ...item, nameKo: translatedName };
    case "ja":
      return { ...item, nameJa: translatedName };
    case "en":
    default:
      return { ...item, nameEn: translatedName };
  }
}

function applySectionTranslation(
  section: MenuSection,
  translatedName: string,
  items: MenuItem[],
  language: TranslationTargetLanguage,
): MenuSection {
  switch (language) {
    case "ko":
      return { ...section, nameKo: translatedName, items };
    case "ja":
      return { ...section, nameJa: translatedName, items };
    case "en":
    default:
      return { ...section, nameEn: translatedName, items };
  }
}

function applyMensaNameTranslation(
  menu: DailyMenu,
  language: TranslationTargetLanguage,
): DailyMenu {
  switch (language) {
    case "ko":
      return { ...menu, mensaNameKo: MENSA_NAME_TRANSLATIONS.ko };
    case "ja":
      return { ...menu, mensaNameJa: MENSA_NAME_TRANSLATIONS.ja };
    case "en":
    default:
      return { ...menu, mensaNameEn: MENSA_NAME_TRANSLATIONS.en };
  }
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
      rawLanguage === "ko" || rawLanguage === "ja" ? rawLanguage : "en";

    if (!isDailyMenu(menu)) {
      return NextResponse.json(
        { error: "Menu data is required and must be valid" },
        { status: 400 },
      );
    }
    if (
      rawLanguage !== undefined &&
      rawLanguage !== "en" &&
      rawLanguage !== "ko" &&
      rawLanguage !== "ja"
    ) {
      return NextResponse.json(
        { error: "Language must be 'en', 'ko', or 'ja'" },
        { status: 400 },
      );
    }

    const cacheDateKey = menu.date;

    const sectionTranslationMap = getSectionTranslationMap(language);

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
  const sectionTranslationMap = getSectionTranslationMap(language);

  const translatedSections: MenuSection[] = menu.sections.map((section) => {
    const translatedItems: MenuItem[] = section.items.map((item) =>
      applyItemTranslation(
        item,
        translations[item.name] || item.name,
        language,
      ),
    );
    const translatedSectionName =
      sectionTranslationMap[section.name] ||
      translations[section.name] ||
      section.name;

    return applySectionTranslation(
      section,
      translatedSectionName,
      translatedItems,
      language,
    );
  });

  return applyMensaNameTranslation(
    {
      ...menu,
      sections: translatedSections,
    },
    language,
  );
}
