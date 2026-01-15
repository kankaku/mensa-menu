import * as cheerio from "cheerio";
import { DailyMenu, MenuItem, MenuPrices, MenuSection } from "./types";

const MENSA_URL =
  "https://www.stw-rw.de/de/mensen-und-cafeterien/speiseplaene.html";

export async function fetchLiveMenu(): Promise<DailyMenu> {
  try {
    const response = await fetch(MENSA_URL, {
      next: { revalidate: 300 }, // Revalidate every 5 minutes
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch menu: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const date = new Date().toISOString().split("T")[0]; // Today's date as fallback

    // Find Mensa Süd
    // The structure is dl > dt (name) + dd (content)
    // We look for the dt containing "Mensa Süd"
    // Use functional approach to find the element and avoid 'any'
    const targetDt = $("dt")
      .filter((_i, el) => $(el).text().trim().includes("Mensa Süd"))
      .first();
    const mensaSuedContent = targetDt.length > 0 ? targetDt.next("dd") : null;

    if (!mensaSuedContent) {
      console.error("Mensa Süd not found in page");
      return {
        date,
        mensaName: "Mensa Süd",
        sections: [],
        fetchedAt: new Date().toISOString(),
      };
    }

    const sections: MenuSection[] = [];
    let currentSection: MenuSection | null = null;

    // Iterate over rows in the table inside the dd
    const rows = mensaSuedContent.find("table tr");

    rows.each((_i, row) => {
      const $row = $(row);

      // Check for section header
      const $sectionHeader = $row.find("td.col_theke b");
      if ($sectionHeader.length > 0) {
        const sectionName = $sectionHeader.text().trim();
        // Skip "Beilagen" if desirable, or keep them.
        // Assuming we start a new section
        currentSection = {
          id: `section-${sections.length}`,
          name: sectionName,
          items: [],
        };
        sections.push(currentSection);
        return; // Continue to next row
      }

      // Check for menu item
      // Selector: tr containing td.mensa_col_55
      const $nameCell = $row.find("td.mensa_col_55");
      if ($nameCell.length > 0) {
        if (!currentSection) {
          // If no section found yet, create a default one
          currentSection = {
            id: "default",
            name: "Menu",
            items: [],
          };
          sections.push(currentSection);
        }

        const name = $nameCell.find("b").text().trim();
        const allergensText = $nameCell.find("span").text().trim();

        // Parse allergens: codes like "Ei Fi Gl.Wz La Mi" (space-separated)
        // Numeric codes (1-10) are additives, others are allergens
        const allCodes = allergensText
          .replace(/[()]/g, "")
          .split(/[\s,]+/)
          .map((s: string) => s.trim())
          .filter((s: string) => s.length > 0);

        // Separate additives (numeric) from allergens (non-numeric)
        const allergens = allCodes.filter((code) => !/^(10|[1-9])$/.test(code));
        const additives = allCodes.filter((code) => /^(10|[1-9])$/.test(code));

        // Fetch prices
        // There are 3 cells with class mensa_col_15
        const prices: MenuPrices = {
          students: "N/A",
          staff: "N/A",
          guests: "N/A",
        };

        $row.find("td.mensa_col_15").each((_i, cell) => {
          const label = $(cell).find("span").text().trim();
          const priceVal = $(cell).find("b").text().trim();

          if (label.includes("Stud")) prices.students = priceVal;
          else if (label.includes("Bed")) prices.staff = priceVal;
          else if (label.includes("Gast")) prices.guests = priceVal;
        });

        const item: MenuItem = {
          id: `item-${sections.length}-${currentSection.items.length}`,
          name,
          category: "meat", // Default, detection logic needed
          allergens,
          additives,
          prices,
        };

        // Try to detect category from name or codes if possible
        // This is a heuristic.
        const lowerName = name.toLowerCase();
        if (lowerName.includes("vegan")) item.category = "vegan";
        else if (
          lowerName.includes("vegetarisch") ||
          lowerName.includes("veget.")
        )
          item.category = "vegetarisch";
        else if (
          lowerName.includes("fisch") ||
          lowerName.includes("lachs") ||
          lowerName.includes("dorsch")
        )
          item.category = "Fisch";

        currentSection.items.push(item);
      }
    });

    return {
      date,
      mensaName: "Mensa Süd",
      sections,
      fetchedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Scraper Error:", error);
    // Return empty menu structure on error
    return {
      date: new Date().toISOString().split("T")[0],
      mensaName: "Mensa Süd",
      sections: [],
      fetchedAt: new Date().toISOString(),
    };
  }
}
