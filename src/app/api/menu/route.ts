import { NextResponse } from "next/server";
import { fetchLiveMenu } from "@/lib/scraper";

export const dynamic = "force-dynamic";
export const revalidate = 300; // 5 minutes

function isFreshRequest(value: string | null): boolean {
  return value === "1" || value === "true";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const forceFresh = isFreshRequest(searchParams.get("fresh"));

  try {
    const menu = await fetchLiveMenu({ forceFresh });

    return NextResponse.json(menu, {
      headers: {
        "Cache-Control": forceFresh
          ? "no-store"
          : "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("Error fetching menu:", error);
    return NextResponse.json(
      { error: "Failed to fetch menu" },
      { status: 500 },
    );
  }
}
