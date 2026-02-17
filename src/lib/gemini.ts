import { GoogleGenAI } from "@google/genai";
import { AppLanguage, TranslationTargetLanguage } from "./types";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const MODEL_NAME = "gemini-3-flash-preview";

/**
 * Batch translate multiple German dish names to English in a single API call
 * Returns a map of { germanName: englishName }
 */
export async function translateItemNames(
  names: string[],
  targetLanguage: TranslationTargetLanguage = "en",
): Promise<Record<string, string>> {
  if (names.length === 0) {
    return {};
  }

  const languageName = targetLanguage === "ko" ? "Korean" : "English";

  const prompt = `Translate the following German food/dish names to ${languageName}. Return ONLY a valid JSON object mapping each German name to its ${languageName} translation.

German names to translate:
${JSON.stringify(names, null, 2)}

Example output format:
{
  "Schnitzel mit Pommes": "${targetLanguage === "ko" ? "감자튀김을 곁들인 슈니첼" : "Schnitzel with French Fries"}",
  "Gemüsepfanne": "${targetLanguage === "ko" ? "채소 볶음" : "Vegetable Pan"}"
}

Important:
- Translate each name accurately
- Keep proper food terminology
- Preserve proper nouns when appropriate
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

    const translations = JSON.parse(cleanedText) as Record<string, string>;
    console.log(
      `[Gemini] Translated ${Object.keys(translations).length} item names`,
    );
    return translations;
  } catch (error) {
    console.error("Batch translation error:", error);
    // Return empty - caller should handle gracefully
    return {};
  }
}

export async function explainDish(
  dishName: string,
  language: AppLanguage = "en",
): Promise<string> {
  const languageInstruction: Record<AppLanguage, string> = {
    en: "Respond in English.",
    de: "Antworten Sie auf Deutsch.",
    ko: "한국어로 답변하세요.",
  };

  const prompt = `${languageInstruction[language]}

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
    const fallbackByLanguage: Record<AppLanguage, string> = {
      en: "Unable to generate explanation at this time.",
      de: "Die Erklärung konnte nicht generiert werden.",
      ko: "지금은 설명을 생성할 수 없습니다.",
    };
    return fallbackByLanguage[language];
  }
}
