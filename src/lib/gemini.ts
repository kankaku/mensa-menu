import { GoogleGenAI } from "@google/genai";
import { DailyMenu } from "./types";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const MODEL_NAME = "gemini-3-flash-preview";

export async function translateMenu(menu: DailyMenu): Promise<DailyMenu> {
  const prompt = `Translate the following German menu data to English. Only translate the food item names and section descriptions, keeping the structure intact. Return ONLY a valid JSON object with the same structure but with translated names.

Menu data:
${JSON.stringify(menu, null, 2)}

Important:
- Translate "name" fields to "nameEn" 
- Keep allergen and additive names in their original German
- Keep IDs unchanged
- Return valid JSON only, no markdown formatting`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });

    const text = response.text || "";

    // Clean up the response - remove markdown code blocks if present
    let cleanedText = text.trim();
    if (cleanedText.startsWith("```json")) {
      cleanedText = cleanedText.slice(7);
    } else if (cleanedText.startsWith("```")) {
      cleanedText = cleanedText.slice(3);
    }
    if (cleanedText.endsWith("```")) {
      cleanedText = cleanedText.slice(0, -3);
    }
    cleanedText = cleanedText.trim();

    const translatedMenu = JSON.parse(cleanedText) as DailyMenu;
    return translatedMenu;
  } catch (error) {
    console.error("Translation error:", error);
    // Return original menu with manual translations for section names
    return addBasicTranslations(menu);
  }
}

function addBasicTranslations(menu: DailyMenu): DailyMenu {
  const sectionTranslations: Record<string, string> = {
    "Mensa Classic": "Mensa Classic",
    "Mensa Life": "Mensa Life",
    "Mensa Diner": "Mensa Diner",
    "Mensa One Pot & Pasta": "Mensa One Pot & Pasta",
  };

  return {
    ...menu,
    mensaNameEn: "Mensa South",
    sections: menu.sections.map((section) => ({
      ...section,
      nameEn: sectionTranslations[section.name] || section.name,
      items: section.items.map((item) => ({
        ...item,
        nameEn: item.name, // Keep original if translation fails
      })),
    })),
  };
}

export async function explainDish(
  dishName: string,
  language: "en" | "de" = "en",
): Promise<string> {
  const languageInstruction =
    language === "en" ? "Respond in English." : "Antworten Sie auf Deutsch.";

  const prompt = `${languageInstruction}

You are a helpful food expert. Provide a brief, informative explanation (2-3 sentences) about the following German dish: "${dishName}"

Include:
- What the dish typically consists of
- Any cultural or regional significance
- A brief description of taste or texture

Keep the response concise and informative. Do not use bullet points or lists.`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });

    return response.text || "Unable to generate explanation.";
  } catch (error) {
    console.error("Explanation error:", error);
    return language === "en"
      ? "Unable to generate explanation at this time."
      : "Die Erklärung konnte nicht generiert werden.";
  }
}

export async function translateText(
  text: string,
  targetLang: "en" | "de",
): Promise<string> {
  const prompt =
    targetLang === "en"
      ? `Translate the following German text to English. Return only the translation, nothing else: "${text}"`
      : `Translate the following English text to German. Return only the translation, nothing else: "${text}"`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });

    return response.text || text;
  } catch (error) {
    console.error("Translation error:", error);
    return text;
  }
}
