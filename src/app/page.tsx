import { fetchLiveMenu } from "@/lib/scraper";
import MenuClient from "@/components/MenuClient";
import { getCachedTranslations } from "@/lib/translation-cache";
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

  // Try to load cached translations and pre-apply them
  const cachedTranslations = await getCachedTranslations();

  // Check if we have cached translations for all menu items
  const allItemNames = menu.sections.flatMap((s) => s.items.map((i) => i.name));
  const allCached = allItemNames.every((name) => cachedTranslations[name]);

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
