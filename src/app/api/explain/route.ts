import { NextRequest, NextResponse } from "next/server";
import { explainDish } from "@/lib/gemini";
import {
  getCachedExplanation,
  setCachedExplanation,
} from "@/lib/translation-cache";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function POST(request: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    if (!isRecord(body)) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const dishName = typeof body.dishName === "string" ? body.dishName.trim() : "";
    const rawLanguage = body.language;
    const language =
      rawLanguage === "de" || rawLanguage === "ko" ? rawLanguage : "en";

    if (!dishName) {
      return NextResponse.json(
        { error: "Dish name is required" },
        { status: 400 },
      );
    }
    if (
      rawLanguage !== undefined &&
      rawLanguage !== "en" &&
      rawLanguage !== "de" &&
      rawLanguage !== "ko"
    ) {
      return NextResponse.json(
        { error: "Language must be 'en', 'de', or 'ko'" },
        { status: 400 },
      );
    }

    // Check cache first
    const cachedExplanation = await getCachedExplanation(dishName, language);
    if (cachedExplanation) {
      return NextResponse.json(
        { explanation: cachedExplanation },
        {
          headers: { "X-Cache": "HIT" },
        },
      );
    }

    // Cache miss - call Gemini API
    console.log(
      `[Explanation] MISS - generating explanation for "${dishName}" (${language})`,
    );
    const explanation = await explainDish(dishName, language);

    // Save to cache
    await setCachedExplanation(dishName, language, explanation);

    return NextResponse.json(
      { explanation },
      {
        headers: { "X-Cache": "MISS" },
      },
    );
  } catch (error) {
    console.error("Explanation error:", error);
    return NextResponse.json(
      { error: "Failed to generate explanation" },
      { status: 500 },
    );
  }
}
