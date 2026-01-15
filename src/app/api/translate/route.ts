import { NextRequest, NextResponse } from "next/server";
import { translateMenu } from "@/lib/gemini";
import { DailyMenu } from "@/lib/types";
import {
  getCachedTranslation,
  setCachedTranslation,
  cleanupOldCache,
} from "@/lib/translation-cache";

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

    // Try to get cached translation first
    const cachedTranslation = await getCachedTranslation(menu);
    if (cachedTranslation) {
      // Cleanup old cache files in the background
      cleanupOldCache().catch(console.error);

      return NextResponse.json(cachedTranslation, {
        headers: {
          "X-Cache": "HIT",
        },
      });
    }

    // No cache found, translate using Gemini API
    console.log("[Translation] Cache miss, calling Gemini API...");
    const translatedMenu = await translateMenu(menu);

    // Save to cache for future requests
    await setCachedTranslation(menu, translatedMenu);

    // Cleanup old cache files in the background
    cleanupOldCache().catch(console.error);

    return NextResponse.json(translatedMenu, {
      headers: {
        "X-Cache": "MISS",
      },
    });
  } catch (error) {
    console.error("Translation error:", error);
    return NextResponse.json(
      { error: "Failed to translate menu" },
      { status: 500 }
    );
  }
}
