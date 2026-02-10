// Types for Mensa Menu Application

export type AppLanguage = "de" | "en" | "ko";
export type TranslationTargetLanguage = Exclude<AppLanguage, "de">;

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
  nameKo?: string;
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
  nameKo?: string;
  items: MenuItem[];
}

export interface DailyMenu {
  date: string;
  mensaName: string;
  mensaNameEn?: string;
  mensaNameKo?: string;
  sections: MenuSection[];
  fetchedAt: string;
}

export interface TranslationRequest {
  menu: DailyMenu;
  language?: TranslationTargetLanguage;
}

export interface ExplanationRequest {
  dishName: string;
  language?: AppLanguage;
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

export const ALLERGEN_LABELS_KO: Record<string, string> = {
  Ei: "달걀",
  En: "땅콩",
  Fi: "생선",
  Gl: "글루텐",
  Kr: "갑각류",
  La: "유당",
  Lu: "루핀",
  Mi: "우유",
  Nu: "견과류",
  Sw: "아황산염",
  Sl: "셀러리",
  Sf: "겨자",
  So: "대두",
  Se: "참깨",
  Wt: "연체동물",
  "Gl.Wz": "밀",
  "Gl.Di": "스펠트밀",
  "Gl.Ro": "호밀",
  "Gl.Ge": "보리",
  "Gl.Hf": "귀리",
  "Gl.Ka": "카무트",
  "Nu.Ma": "아몬드",
  "Nu.Ha": "헤이즐넛",
  "Nu.Wa": "호두",
  "Nu.Ca": "캐슈넛",
  "Nu.Pe": "피칸",
  "Nu.Pa": "브라질너트",
  "Nu.Pi": "피스타치오",
  "Nu.Mc": "마카다미아",
  "Nu.Qu": "퀸즐랜드 너트",
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

export const ADDITIVE_LABELS_KO: Record<string, string> = {
  "1": "착색료",
  "2": "보존료",
  "3": "산화방지제",
  "4": "향미증진제",
  "5": "아황산 처리",
  "6": "흑화 처리",
  "7": "왁스 처리",
  "8": "인산염",
  "9": "감미료",
  "10": "페닐알라닌 함유",
};

// Section name translations
export const SECTION_TRANSLATIONS_EN: Record<string, string> = {
  "Mensa Classic": "Mensa Classic",
  "Mensa Life": "Mensa Life",
  "Mensa Diner": "Mensa Diner",
  "Mensa One Pot & Pasta": "Mensa One Pot & Pasta",
};

export const SECTION_TRANSLATIONS_KO: Record<string, string> = {
  "Mensa Classic": "Mensa Classic",
  "Mensa Life": "Mensa Life",
  "Mensa Diner": "Mensa Diner",
  "Mensa One Pot & Pasta": "Mensa One Pot & Pasta",
};

export const MENSA_NAME_TRANSLATIONS: Record<TranslationTargetLanguage, string> = {
  en: "Mensa South",
  ko: "멘자 남부",
};

type TooltipText = {
  de: string;
  en: string;
  ko?: string;
};

// Allergen tooltip descriptions - using official short codes
export const ALLERGEN_TOOLTIPS: Record<string, TooltipText> = {
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

export const ALLERGEN_TOOLTIPS_KO: Record<string, string> = {
  Ei: "달걀 또는 달걀 함유 성분이 포함되어 있습니다",
  En: "땅콩이 포함되어 있습니다",
  Fi: "생선 또는 생선 함유 성분이 포함되어 있습니다",
  Gl: "글루텐 함유 곡물이 포함되어 있습니다",
  Kr: "갑각류가 포함되어 있습니다",
  La: "유당이 포함되어 있습니다",
  Lu: "루핀이 포함되어 있습니다",
  Mi: "우유가 포함되어 있습니다",
  Nu: "견과류가 포함되어 있습니다",
  Sw: "아황산염이 포함되어 있습니다",
  Sl: "셀러리가 포함되어 있습니다",
  Sf: "겨자가 포함되어 있습니다",
  So: "대두가 포함되어 있습니다",
  Se: "참깨가 포함되어 있습니다",
  Wt: "연체동물이 포함되어 있습니다",
  "Gl.Wz": "밀이 포함되어 있습니다",
  "Gl.Di": "스펠트밀이 포함되어 있습니다",
  "Gl.Ro": "호밀이 포함되어 있습니다",
  "Gl.Ge": "보리가 포함되어 있습니다",
  "Gl.Hf": "귀리가 포함되어 있습니다",
  "Gl.Ka": "카무트가 포함되어 있습니다",
  "Nu.Ma": "아몬드가 포함되어 있습니다",
  "Nu.Ha": "헤이즐넛이 포함되어 있습니다",
  "Nu.Wa": "호두가 포함되어 있습니다",
  "Nu.Ca": "캐슈넛이 포함되어 있습니다",
  "Nu.Pe": "피칸이 포함되어 있습니다",
  "Nu.Pa": "브라질너트가 포함되어 있습니다",
  "Nu.Pi": "피스타치오가 포함되어 있습니다",
  "Nu.Mc": "마카다미아가 포함되어 있습니다",
  "Nu.Qu": "퀸즐랜드 너트가 포함되어 있습니다",
};

// Additive tooltip descriptions - using official numeric codes
export const ADDITIVE_TOOLTIPS: Record<string, TooltipText> = {
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

export const ADDITIVE_TOOLTIPS_KO: Record<string, string> = {
  "1": "착색료가 사용되었습니다",
  "2": "보존료가 사용되었습니다",
  "3": "산화방지제가 사용되었습니다",
  "4": "향미증진제가 사용되었습니다",
  "5": "아황산 처리가 되어 있습니다",
  "6": "흑화 처리되어 있습니다",
  "7": "왁스 처리가 되어 있습니다",
  "8": "인산염이 사용되었습니다",
  "9": "감미료가 사용되었습니다",
  "10": "페닐알라닌 공급원이 포함되어 있습니다",
};

// Dietary category tooltips
export const CATEGORY_TOOLTIPS: Record<string, TooltipText> = {
  vegan: {
    de: "Ohne tierische Produkte",
    en: "No animal products",
    ko: "동물성 재료 없음",
  },
  vegetarisch: {
    de: "Ohne Fleisch, kann Milch/Eier enthalten",
    en: "No meat, may contain dairy/eggs",
    ko: "고기 없음, 유제품/달걀 포함 가능",
  },
  Fisch: {
    de: "Enthält Fisch",
    en: "Contains fish",
    ko: "생선 포함",
  },
  meat: {
    de: "Enthält Fleisch",
    en: "Contains meat",
    ko: "육류 포함",
  },
};
