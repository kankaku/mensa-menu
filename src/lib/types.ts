// Types for Mensa Menu Application

export type DietaryCategory = "vegan" | "vegetarisch" | "Fisch" | "meat";

export interface MenuItem {
  id: string;
  name: string;
  nameEn?: string;
  category: DietaryCategory;
  allergens: string[];
  additives: string[];
  lastServed?: string;
}

export interface MenuSection {
  id: string;
  name: string;
  nameEn?: string;
  items: MenuItem[];
}

export interface DailyMenu {
  date: string;
  mensaName: string;
  mensaNameEn?: string;
  sections: MenuSection[];
  fetchedAt: string;
}

export interface TranslationRequest {
  menu: DailyMenu;
}

export interface ExplanationRequest {
  dishName: string;
  language?: "en" | "de";
}

export interface ExplanationResponse {
  explanation: string;
}

// Allergen mappings
export const ALLERGEN_LABELS: Record<string, string> = {
  Ei: "Egg",
  Erdnuss: "Peanut",
  Fisch: "Fish",
  Gluten: "Gluten",
  Krebstiere: "Crustaceans",
  Laktose: "Lactose",
  Lupinen: "Lupins",
  Milch: "Milk",
  Nüsse: "Nuts",
  Sellerie: "Celery",
  Senf: "Mustard",
  Sesam: "Sesame",
  Soja: "Soy",
  Schwefeldioxid: "Sulfites",
  Weichtiere: "Molluscs",
};

// Additive mappings
export const ADDITIVE_LABELS: Record<string, string> = {
  Farbstoff: "Colorant",
  Konservierungsstoffe: "Preservatives",
  Antioxidationsmittel: "Antioxidants",
  Geschmacksverstärker: "Flavor Enhancer",
  geschwefelt: "Sulfured",
  geschwärzt: "Blackened",
  gewachst: "Waxed",
  Phosphat: "Phosphate",
  Süßungsmittel: "Sweetener",
};

// Section name translations
export const SECTION_TRANSLATIONS: Record<string, string> = {
  "Mensa Classic": "Mensa Classic",
  "Mensa Life": "Mensa Life",
  "Mensa Diner": "Mensa Diner",
  "Mensa One Pot & Pasta": "Mensa One Pot & Pasta",
};

// Allergen tooltip descriptions
export const ALLERGEN_TOOLTIPS: Record<string, { de: string; en: string }> = {
  Ei: {
    de: "Enthält Eier oder Eiprodukte",
    en: "Contains eggs or egg products",
  },
  Erdnuss: { de: "Enthält Erdnüsse", en: "Contains peanuts" },
  Fisch: {
    de: "Enthält Fisch oder Fischprodukte",
    en: "Contains fish or fish products",
  },
  Gluten: {
    de: "Enthält Weizen, Roggen, Gerste oder Hafer",
    en: "Contains wheat, rye, barley or oats",
  },
  Krebstiere: {
    de: "Enthält Krebstiere wie Garnelen, Krabben",
    en: "Contains crustaceans like shrimp, crab",
  },
  Laktose: { de: "Enthält Milchzucker", en: "Contains milk sugar (lactose)" },
  Lupinen: {
    de: "Enthält Lupinen oder Lupinenprodukte",
    en: "Contains lupins or lupin products",
  },
  Milch: {
    de: "Enthält Milch oder Milchprodukte",
    en: "Contains milk or dairy products",
  },
  Nüsse: {
    de: "Enthält Nüsse wie Mandeln, Haselnüsse, Walnüsse",
    en: "Contains nuts like almonds, hazelnuts, walnuts",
  },
  Sellerie: {
    de: "Enthält Sellerie oder Sellerieprodukte",
    en: "Contains celery or celery products",
  },
  Senf: {
    de: "Enthält Senf oder Senfprodukte",
    en: "Contains mustard or mustard products",
  },
  Sesam: { de: "Enthält Sesamsamen", en: "Contains sesame seeds" },
  Soja: {
    de: "Enthält Soja oder Sojaprodukte",
    en: "Contains soy or soy products",
  },
  Schwefeldioxid: {
    de: "Enthält Schwefeldioxid oder Sulfite",
    en: "Contains sulfur dioxide or sulfites",
  },
  Weichtiere: {
    de: "Enthält Weichtiere wie Muscheln, Schnecken",
    en: "Contains molluscs like mussels, snails",
  },
};

// Additive tooltip descriptions
export const ADDITIVE_TOOLTIPS: Record<string, { de: string; en: string }> = {
  Farbstoff: {
    de: "Enthält künstliche Farbstoffe",
    en: "Contains artificial colorants",
  },
  Konservierungsstoffe: {
    de: "Enthält Konservierungsmittel",
    en: "Contains preservatives",
  },
  Antioxidationsmittel: {
    de: "Enthält Antioxidantien zur Haltbarkeit",
    en: "Contains antioxidants for preservation",
  },
  Geschmacksverstärker: {
    de: "Enthält Geschmacksverstärker wie Glutamat",
    en: "Contains flavor enhancers like MSG",
  },
  geschwefelt: {
    de: "Mit Schwefeldioxid behandelt",
    en: "Treated with sulfur dioxide",
  },
  geschwärzt: { de: "Mit Farbstoff geschwärzt", en: "Blackened with colorant" },
  gewachst: {
    de: "Oberfläche mit Wachs behandelt",
    en: "Surface treated with wax",
  },
  Phosphat: { de: "Enthält Phosphate", en: "Contains phosphates" },
  Süßungsmittel: {
    de: "Enthält künstliche Süßstoffe",
    en: "Contains artificial sweeteners",
  },
};

// Dietary category tooltips
export const CATEGORY_TOOLTIPS: Record<string, { de: string; en: string }> = {
  vegan: { de: "Ohne tierische Produkte", en: "No animal products" },
  vegetarisch: {
    de: "Ohne Fleisch, kann Milch/Eier enthalten",
    en: "No meat, may contain dairy/eggs",
  },
  Fisch: { de: "Enthält Fisch", en: "Contains fish" },
  meat: { de: "Enthält Fleisch", en: "Contains meat" },
};
