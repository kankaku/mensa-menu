import * as cheerio from "cheerio";
import { DailyMenu, MenuSection, MenuItem, DietaryCategory } from "./types";

const IMENSA_URL = "https://www.imensa.de/rostock/mensa-sued/index.html";

function generateId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9äöüß]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function parseDietaryCategory(text: string): DietaryCategory {
  const lowerText = text.toLowerCase();
  if (lowerText.includes("vegan")) return "vegan";
  if (lowerText.includes("vegetarisch")) return "vegetarisch";
  if (lowerText.includes("fisch")) return "Fisch";
  return "meat";
}

function parseAllergens(text: string): string[] {
  const allergenKeywords = [
    "Ei",
    "Erdnuss",
    "Fisch",
    "Gluten",
    "Krebstiere",
    "Laktose",
    "Lupinen",
    "Milch",
    "Nüsse",
    "Sellerie",
    "Senf",
    "Sesam",
    "Soja",
    "Schwefeldioxid",
    "Weichtiere",
  ];

  const found: string[] = [];
  for (const allergen of allergenKeywords) {
    if (text.includes(allergen)) {
      found.push(allergen);
    }
  }
  return found;
}

function parseAdditives(text: string): string[] {
  const additiveKeywords = [
    "Farbstoff",
    "Konservierungsstoffe",
    "Antioxidationsmittel",
    "Geschmacksverstärker",
    "geschwefelt",
    "geschwärzt",
    "gewachst",
    "Phosphat",
    "Süßungsmittel",
  ];

  const found: string[] = [];
  for (const additive of additiveKeywords) {
    if (text.includes(additive)) {
      found.push(additive);
    }
  }
  return found;
}

export async function fetchLiveMenu(): Promise<DailyMenu> {
  try {
    const response = await fetch(IMENSA_URL, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; MensaMenuApp/1.0)",
        Accept: "text/html,application/xhtml+xml",
      },
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    return parseMenuFromHtml(html);
  } catch (error) {
    console.error("Failed to fetch live menu:", error);
    return createFallbackMenu();
  }
}

function parseMenuFromHtml(html: string): DailyMenu {
  const $ = cheerio.load(html);

  const today = new Date();
  const dateStr = today.toLocaleDateString("de-DE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const sections: MenuSection[] = [];
  const sectionNames = [
    "Mensa Classic",
    "Mensa Life",
    "Mensa Diner",
    "Mensa One Pot & Pasta",
  ];

  // Try to parse sections from h3 headers
  $("h3").each((_, el) => {
    const sectionTitle = $(el).text().trim();

    if (sectionNames.includes(sectionTitle)) {
      const section: MenuSection = {
        id: generateId(sectionTitle),
        name: sectionTitle,
        items: [],
      };

      let current = $(el).next();
      while (current.length && !current.is("h3")) {
        const itemText = current.text().trim();
        if (itemText && itemText.length > 3) {
          const lines = itemText
            .split("\n")
            .map((l) => l.trim())
            .filter((l) => l);

          if (lines.length > 0) {
            const name = lines[0];
            const metaText = lines.slice(1).join(" ");

            if (
              !name.includes("ALLERGEN") &&
              !name.includes("ZULETZT") &&
              name.length > 2
            ) {
              section.items.push({
                id: generateId(name),
                name,
                category: parseDietaryCategory(metaText),
                allergens: parseAllergens(metaText),
                additives: parseAdditives(metaText),
              });
            }
          }
        }
        current = current.next();
      }

      if (section.items.length > 0) {
        sections.push(section);
      }
    }
  });

  if (sections.length === 0) {
    return createFallbackMenu();
  }

  return {
    date: dateStr,
    mensaName: "Mensa Süd",
    mensaNameEn: "Mensa South",
    sections,
    fetchedAt: new Date().toISOString(),
  };
}

function createFallbackMenu(): DailyMenu {
  const today = new Date();
  const dateStr = today.toLocaleDateString("de-DE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return {
    date: dateStr,
    mensaName: "Mensa Süd",
    mensaNameEn: "Mensa South",
    sections: [
      {
        id: "mensa-classic",
        name: "Mensa Classic",
        items: [
          {
            id: "seelachsfilet",
            name: "Seelachsfilet in Cornflakespanade",
            category: "Fisch",
            allergens: ["Ei", "Fisch", "Gluten"],
            additives: [],
          },
          {
            id: "remoulade",
            name: "Remoulade",
            category: "vegetarisch",
            allergens: ["Ei", "Gluten", "Milch", "Senf", "Soja"],
            additives: [],
          },
          {
            id: "bolognese",
            name: "Bolognese (Rind)",
            category: "meat",
            allergens: ["Sellerie"],
            additives: [],
          },
          {
            id: "hartkase",
            name: "Italienischer Hartkäse",
            category: "vegetarisch",
            allergens: ["Ei", "Milch"],
            additives: [],
          },
          {
            id: "kartoffeln",
            name: "Kartoffeln",
            category: "vegan",
            allergens: [],
            additives: ["Antioxidationsmittel"],
          },
          {
            id: "spaghetti-mix",
            name: "Spaghetti-Mix",
            category: "vegan",
            allergens: ["Gluten"],
            additives: [],
          },
          {
            id: "reis",
            name: "Reis",
            category: "vegan",
            allergens: [],
            additives: [],
          },
          {
            id: "pommes-frites-classic",
            name: "Pommes frites",
            category: "vegan",
            allergens: [],
            additives: [],
          },
          {
            id: "mohren-zucchini",
            name: "Möhren-Zucchini-Gemüse",
            category: "vegan",
            allergens: [],
            additives: [],
          },
          {
            id: "blumenkohl",
            name: "Blumenkohl mit Semmelbutter",
            category: "vegetarisch",
            allergens: ["Gluten", "Milch"],
            additives: [],
          },
          {
            id: "tomatensauce",
            name: "Tomatensauce",
            category: "vegan",
            allergens: [],
            additives: [],
          },
          {
            id: "geflugelsauce",
            name: "Geflügelsauce",
            category: "meat",
            allergens: ["Ei"],
            additives: [],
          },
          {
            id: "hollandaise",
            name: "Hollandaise",
            category: "vegetarisch",
            allergens: ["Ei", "Milch"],
            additives: [],
          },
        ],
      },
      {
        id: "mensa-diner",
        name: "Mensa Diner",
        items: [
          {
            id: "pommes-diner",
            name: "Pommes frites",
            category: "vegan",
            allergens: [],
            additives: [],
          },
          {
            id: "tomatenreis",
            name: "Tomatenreis",
            category: "vegan",
            allergens: [],
            additives: [],
          },
          {
            id: "gyros",
            name: "Schweinefleischstreifen Gyros Art mit Tzatziki",
            category: "meat",
            allergens: ["Ei", "Milch", "Senf"],
            additives: ["Konservierungsstoffe"],
          },
          {
            id: "weisskrautsalat",
            name: "Weisskrautsalat",
            category: "vegan",
            allergens: [],
            additives: [],
          },
        ],
      },
      {
        id: "mensa-life",
        name: "Mensa Life",
        items: [
          {
            id: "gekochte-eier",
            name: "Zwei gekochte Eier mit Senfsauce",
            category: "vegetarisch",
            allergens: ["Ei", "Gluten", "Milch", "Senf"],
            additives: ["Farbstoff"],
          },
          {
            id: "zusatzliches-ei",
            name: "Ein zusätzliches Ei",
            category: "vegetarisch",
            allergens: ["Ei"],
            additives: [],
          },
          {
            id: "orientalische-gemusepfanne",
            name: "Orientalische Gemüsepfanne mit Kichererbsen",
            category: "vegan",
            allergens: [],
            additives: [],
          },
          {
            id: "nuggets-jackfruit",
            name: "4 Nuggets aus Schwarzwurzeln und Jackfruit",
            category: "vegan",
            allergens: ["Gluten"],
            additives: [],
          },
          {
            id: "grunkohl-pfanne",
            name: "Grünkohlpfanne mit Süsskartoffelgnocchi und Sonnenblumenhack in Senfcreme",
            category: "vegan",
            allergens: ["Sellerie", "Senf", "Soja"],
            additives: [],
          },
          {
            id: "tomaten-zucchini",
            name: "Tomaten-Zucchini-Pfanne",
            category: "vegan",
            allergens: ["Soja"],
            additives: [],
          },
          {
            id: "reis-life",
            name: "Reis",
            category: "vegan",
            allergens: [],
            additives: [],
          },
          {
            id: "gemuesecouscous",
            name: "Gemüsecouscous",
            category: "vegan",
            allergens: ["Gluten", "Sellerie"],
            additives: [],
          },
          {
            id: "kartoffeln-life",
            name: "Kartoffeln",
            category: "vegan",
            allergens: [],
            additives: ["Antioxidationsmittel"],
          },
          {
            id: "gemuse-mix",
            name: "Gemüse-Mix",
            category: "vegan",
            allergens: [],
            additives: [],
          },
          {
            id: "krautersauce",
            name: "Kräutersauce",
            category: "vegan",
            allergens: [],
            additives: [],
          },
          {
            id: "hollandaise-life",
            name: "Hollandaise",
            category: "vegetarisch",
            allergens: ["Ei", "Milch"],
            additives: [],
          },
        ],
      },
      {
        id: "mensa-one-pot-pasta",
        name: "Mensa One Pot & Pasta",
        items: [
          {
            id: "gemuseeintopf",
            name: "Meal-Deal: italienischer Gemüseeintopf",
            category: "vegan",
            allergens: ["Sellerie"],
            additives: [],
          },
          {
            id: "spinat-erdnuss-pasta",
            name: "Meal-Deal: Spinat-Erdnuss-Pasta",
            category: "vegan",
            allergens: ["Erdnuss", "Gluten", "Soja"],
            additives: [],
          },
          {
            id: "nudeln",
            name: "Nudeln",
            category: "vegan",
            allergens: ["Gluten"],
            additives: [],
          },
          {
            id: "pastasauce-hahnchen",
            name: "Pastasauce mit Zucchini und Hähnchenstreifen",
            category: "meat",
            allergens: ["Milch"],
            additives: [],
          },
          {
            id: "paprikasauce-hack",
            name: "Paprikasauce mit Sonnenblumenhack",
            category: "vegan",
            allergens: ["Sellerie", "Senf"],
            additives: [],
          },
          {
            id: "hartkase-pasta",
            name: "Italienischer Hartkäse",
            category: "vegetarisch",
            allergens: ["Ei", "Milch"],
            additives: [],
          },
        ],
      },
    ],
    fetchedAt: new Date().toISOString(),
  };
}

export async function scrapeMenu(): Promise<DailyMenu> {
  return fetchLiveMenu();
}
