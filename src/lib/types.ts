// Types for Mensa Menu Application

export type DietaryCategory = "vegan" | "vegetarisch" | "Fisch" | "meat";

export interface MenuPrices {
  students: string;
  staff: string;
  guests: string;
}

export interface MenuItem {
  id: string;
  name: string;
  nameEn?: string;
  category: DietaryCategory;
  prices: MenuPrices;
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

// Allergen mappings - using official short codes from Mensa website
export const ALLERGEN_LABELS: Record<string, string> = {
  // Main allergen codes
  Ei: "Egg",
  En: "Peanut",
  Fi: "Fish",
  Gl: "Gluten",
  Kr: "Crustaceans",
  La: "Lactose",
  Lu: "Lupins",
  Mi: "Milk",
  Nu: "Nuts",
  Sw: "Sulfites",
  Sl: "Celery",
  Sf: "Mustard",
  So: "Soy",
  Se: "Sesame",
  Wt: "Molluscs",
  // Gluten variants
  "Gl.Wz": "Wheat",
  "Gl.Di": "Spelt",
  "Gl.Ro": "Rye",
  "Gl.Ge": "Barley",
  "Gl.Hf": "Oats",
  "Gl.Ka": "Kamut",
  // Nut variants
  "Nu.Ma": "Almonds",
  "Nu.Ha": "Hazelnuts",
  "Nu.Wa": "Walnuts",
  "Nu.Ca": "Cashews",
  "Nu.Pe": "Pecans",
  "Nu.Pa": "Brazil Nuts",
  "Nu.Pi": "Pistachios",
  "Nu.Mc": "Macadamia",
  "Nu.Qu": "Queensland Nuts",
};

// Additive mappings - using official numeric codes from Mensa website
export const ADDITIVE_LABELS: Record<string, string> = {
  "1": "Colorant",
  "2": "Preservatives",
  "3": "Antioxidants",
  "4": "Flavor Enhancer",
  "5": "Sulfured",
  "6": "Blackened",
  "7": "Waxed",
  "8": "Phosphate",
  "9": "Sweetener",
  "10": "Phenylalanine",
};

// Section name translations
export const SECTION_TRANSLATIONS: Record<string, string> = {
  "Mensa Classic": "Mensa Classic",
  "Mensa Life": "Mensa Life",
  "Mensa Diner": "Mensa Diner",
  "Mensa One Pot & Pasta": "Mensa One Pot & Pasta",
};

// Allergen tooltip descriptions - using official short codes
export const ALLERGEN_TOOLTIPS: Record<string, { de: string; en: string }> = {
  Ei: {
    de: "Enthält Eier oder Eiprodukte",
    en: "Contains eggs or egg products",
  },
  En: { de: "Enthält Erdnüsse", en: "Contains peanuts" },
  Fi: {
    de: "Enthält Fisch oder Fischprodukte",
    en: "Contains fish or fish products",
  },
  Gl: {
    de: "Enthält glutenhaltiges Getreide",
    en: "Contains gluten-containing grains",
  },
  Kr: { de: "Enthält Krebstiere", en: "Contains crustaceans" },
  La: { de: "Enthält Milchzucker", en: "Contains lactose" },
  Lu: { de: "Enthält Lupinen", en: "Contains lupins" },
  Mi: { de: "Enthält Milch", en: "Contains milk" },
  Nu: { de: "Enthält Schalenfrüchte", en: "Contains nuts" },
  Sw: { de: "Enthält Schwefeldioxid/Sulfite", en: "Contains sulfites" },
  Sl: { de: "Enthält Sellerie", en: "Contains celery" },
  Sf: { de: "Enthält Senf", en: "Contains mustard" },
  So: { de: "Enthält Soja", en: "Contains soy" },
  Se: { de: "Enthält Sesam", en: "Contains sesame" },
  Wt: { de: "Enthält Weichtiere", en: "Contains molluscs" },
  // Gluten variants
  "Gl.Wz": { de: "Enthält Weizen", en: "Contains wheat" },
  "Gl.Di": { de: "Enthält Dinkel", en: "Contains spelt" },
  "Gl.Ro": { de: "Enthält Roggen", en: "Contains rye" },
  "Gl.Ge": { de: "Enthält Gerste", en: "Contains barley" },
  "Gl.Hf": { de: "Enthält Hafer", en: "Contains oats" },
  "Gl.Ka": { de: "Enthält Kamut", en: "Contains kamut" },
  // Nut variants
  "Nu.Ma": { de: "Enthält Mandeln", en: "Contains almonds" },
  "Nu.Ha": { de: "Enthält Haselnüsse", en: "Contains hazelnuts" },
  "Nu.Wa": { de: "Enthält Walnüsse", en: "Contains walnuts" },
  "Nu.Ca": { de: "Enthält Cashewkerne", en: "Contains cashews" },
  "Nu.Pe": { de: "Enthält Pekannüsse", en: "Contains pecans" },
  "Nu.Pa": { de: "Enthält Paranüsse", en: "Contains brazil nuts" },
  "Nu.Pi": { de: "Enthält Pistazien", en: "Contains pistachios" },
  "Nu.Mc": { de: "Enthält Macadamianüsse", en: "Contains macadamia" },
  "Nu.Qu": { de: "Enthält Queenslandnüsse", en: "Contains queensland nuts" },
};

// Additive tooltip descriptions - using official numeric codes
export const ADDITIVE_TOOLTIPS: Record<string, { de: string; en: string }> = {
  "1": { de: "Mit Farbstoff", en: "With colorant" },
  "2": { de: "Mit Konservierungsstoff", en: "With preservatives" },
  "3": { de: "Mit Antioxidationsmittel", en: "With antioxidants" },
  "4": { de: "Mit Geschmacksverstärker", en: "With flavor enhancer" },
  "5": { de: "Geschwefelt", en: "Sulfured" },
  "6": { de: "Geschwärzt", en: "Blackened" },
  "7": { de: "Gewachst", en: "Waxed" },
  "8": { de: "Mit Phosphat", en: "With phosphate" },
  "9": { de: "Mit Süßungsmittel", en: "With sweetener" },
  "10": {
    de: "Enthält Phenylalaninquelle",
    en: "Contains phenylalanine source",
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
