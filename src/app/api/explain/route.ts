import { NextRequest, NextResponse } from "next/server";
import { explainDish } from "@/lib/gemini";
import {
  getCachedExplanation,
  setCachedExplanation,
} from "@/lib/translation-cache";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { dishName, language = "en" } = body;

    if (!dishName) {
      return NextResponse.json(
        { error: "Dish name is required" },
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
