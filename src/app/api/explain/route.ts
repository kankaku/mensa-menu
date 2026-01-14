import { NextRequest, NextResponse } from "next/server";
import { explainDish } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { dishName, language = "en" } = body;

    if (!dishName) {
      return NextResponse.json(
        { error: "Dish name is required" },
        { status: 400 }
      );
    }

    const explanation = await explainDish(dishName, language);

    return NextResponse.json({ explanation });
  } catch (error) {
    console.error("Explanation error:", error);
    return NextResponse.json(
      { error: "Failed to generate explanation" },
      { status: 500 }
    );
  }
}
