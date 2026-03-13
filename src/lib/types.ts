// Types for Mensa Menu Application

export type AppLanguage = "de" | "en" | "ko" | "ja";
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
  nameJa?: string;
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
  nameJa?: string;
  items: MenuItem[];
}

export interface DailyMenu {
  date: string;
  mensaName: string;
  mensaNameEn?: string;
  mensaNameKo?: string;
  mensaNameJa?: string;
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

export const ALLERGEN_LABELS_JA: Record<string, string> = {
  Ei: "卵",
  En: "ピーナッツ",
  Fi: "魚",
  Gl: "グルテン",
  Kr: "甲殻類",
  La: "乳糖",
  Lu: "ルピナス",
  Mi: "牛乳",
  Nu: "ナッツ類",
  Sw: "亜硫酸塩",
  Sl: "セロリ",
  Sf: "マスタード",
  So: "大豆",
  Se: "ごま",
  Wt: "軟体動物",
  "Gl.Wz": "小麦",
  "Gl.Di": "スペルト小麦",
  "Gl.Ro": "ライ麦",
  "Gl.Ge": "大麦",
  "Gl.Hf": "オーツ麦",
  "Gl.Ka": "カムート",
  "Nu.Ma": "アーモンド",
  "Nu.Ha": "ヘーゼルナッツ",
  "Nu.Wa": "くるみ",
  "Nu.Ca": "カシューナッツ",
  "Nu.Pe": "ピーカンナッツ",
  "Nu.Pa": "ブラジルナッツ",
  "Nu.Pi": "ピスタチオ",
  "Nu.Mc": "マカダミアナッツ",
  "Nu.Qu": "クイーンズランドナッツ",
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

export const ADDITIVE_LABELS_JA: Record<string, string> = {
  "1": "着色料",
  "2": "保存料",
  "3": "酸化防止剤",
  "4": "調味料",
  "5": "亜硫酸処理",
  "6": "黒変処理",
  "7": "ワックス処理",
  "8": "リン酸塩",
  "9": "甘味料",
  "10": "フェニルアラニン源",
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

export const SECTION_TRANSLATIONS_JA: Record<string, string> = {
  "Mensa Classic": "Mensa Classic",
  "Mensa Life": "Mensa Life",
  "Mensa Diner": "Mensa Diner",
  "Mensa One Pot & Pasta": "Mensa One Pot & Pasta",
};

export const MENSA_NAME_TRANSLATIONS: Record<TranslationTargetLanguage, string> = {
  en: "Mensa South",
  ko: "멘자 남부",
  ja: "メンザ南部",
};

type TooltipText = {
  de: string;
  en: string;
  ko?: string;
  ja?: string;
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

export const ALLERGEN_TOOLTIPS_JA: Record<string, string> = {
  Ei: "卵または卵由来成分を含みます",
  En: "ピーナッツを含みます",
  Fi: "魚または魚由来成分を含みます",
  Gl: "グルテンを含む穀物を含みます",
  Kr: "甲殻類を含みます",
  La: "乳糖を含みます",
  Lu: "ルピナスを含みます",
  Mi: "牛乳を含みます",
  Nu: "ナッツ類を含みます",
  Sw: "亜硫酸塩を含みます",
  Sl: "セロリを含みます",
  Sf: "マスタードを含みます",
  So: "大豆を含みます",
  Se: "ごまを含みます",
  Wt: "軟体動物を含みます",
  "Gl.Wz": "小麦を含みます",
  "Gl.Di": "スペルト小麦を含みます",
  "Gl.Ro": "ライ麦を含みます",
  "Gl.Ge": "大麦を含みます",
  "Gl.Hf": "オーツ麦を含みます",
  "Gl.Ka": "カムートを含みます",
  "Nu.Ma": "アーモンドを含みます",
  "Nu.Ha": "ヘーゼルナッツを含みます",
  "Nu.Wa": "くるみを含みます",
  "Nu.Ca": "カシューナッツを含みます",
  "Nu.Pe": "ピーカンナッツを含みます",
  "Nu.Pa": "ブラジルナッツを含みます",
  "Nu.Pi": "ピスタチオを含みます",
  "Nu.Mc": "マカダミアナッツを含みます",
  "Nu.Qu": "クイーンズランドナッツを含みます",
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

export const ADDITIVE_TOOLTIPS_JA: Record<string, string> = {
  "1": "着色料を使用しています",
  "2": "保存料を使用しています",
  "3": "酸化防止剤を使用しています",
  "4": "調味料を使用しています",
  "5": "亜硫酸処理されています",
  "6": "黒変処理されています",
  "7": "ワックス処理されています",
  "8": "リン酸塩を使用しています",
  "9": "甘味料を使用しています",
  "10": "フェニルアラニン源を含みます",
};

// Dietary category tooltips
export const CATEGORY_TOOLTIPS: Record<string, TooltipText> = {
  vegan: {
    de: "Ohne tierische Produkte",
    en: "No animal products",
    ko: "동물성 재료 없음",
    ja: "動物性食材不使用",
  },
  vegetarisch: {
    de: "Ohne Fleisch, kann Milch/Eier enthalten",
    en: "No meat, may contain dairy/eggs",
    ko: "고기 없음, 유제품/달걀 포함 가능",
    ja: "肉不使用、乳製品や卵を含む場合があります",
  },
  Fisch: {
    de: "Enthält Fisch",
    en: "Contains fish",
    ko: "생선 포함",
    ja: "魚を含みます",
  },
  meat: {
    de: "Enthält Fleisch",
    en: "Contains meat",
    ko: "육류 포함",
    ja: "肉を含みます",
  },
};
