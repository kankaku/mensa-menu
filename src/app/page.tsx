import { fetchLiveMenu } from "@/lib/scraper";
import MenuClient from "@/components/MenuClient";
import { getCachedTranslationsForDate } from "@/lib/translation-cache";
import {
  DailyMenu,
  MenuSection,
  MenuItem,
  SECTION_TRANSLATIONS,
} from "@/lib/types";

export const revalidate = 300;

/**
 * Apply cached translations to a menu (server-side)
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

export default async function Home() {
  const menu = await fetchLiveMenu();
  const cachedTranslations = await getCachedTranslationsForDate(menu.date);

  // Check if we have cached translations for all menu names we need.
  const allNames = new Set<string>();
  for (const section of menu.sections) {
    for (const item of section.items) {
      allNames.add(item.name);
    }
    if (!SECTION_TRANSLATIONS[section.name]) {
      allNames.add(section.name);
    }
  }
  const allCached = [...allNames].every((name) => cachedTranslations[name]);

  // If all items are cached, pre-apply translations
  const initialTranslatedMenu = allCached
    ? applyTranslations(menu, cachedTranslations)
    : null;

  return (
    <MenuClient
      initialMenu={menu}
      initialTranslatedMenu={initialTranslatedMenu}
    />
  );
}
