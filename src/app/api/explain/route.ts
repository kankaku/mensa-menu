import { NextRequest, NextResponse } from "next/server";
import { getExplanationForDish } from "@/lib/server-cache";

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

    const explanation = await getExplanationForDish(dishName, language);

    return NextResponse.json(
      { explanation },
      {
        headers: { "X-Cache": "DATA-CACHE" },
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
