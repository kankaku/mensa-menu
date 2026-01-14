import { NextRequest, NextResponse } from "next/server";
import { translateMenu } from "@/lib/gemini";
import { DailyMenu } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const menu = body.menu as DailyMenu;

    if (!menu) {
      return NextResponse.json(
        { error: "Menu data is required" },
        { status: 400 }
      );
    }

    const translatedMenu = await translateMenu(menu);

    return NextResponse.json(translatedMenu);
  } catch (error) {
    console.error("Translation error:", error);
    return NextResponse.json(
      { error: "Failed to translate menu" },
      { status: 500 }
    );
  }
}
