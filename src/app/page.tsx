import { scrapeMenu } from "@/lib/scraper";
import { MenuClient } from "@/components";

export const revalidate = 300;

export default async function Home() {
  const menu = await scrapeMenu();

  return <MenuClient initialMenu={menu} />;
}
