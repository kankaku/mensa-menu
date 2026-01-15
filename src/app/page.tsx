import { fetchLiveMenu } from "@/lib/scraper";
import MenuClient from "@/components/MenuClient";

export const revalidate = 300;

export default async function Home() {
  const menu = await fetchLiveMenu();

  return <MenuClient initialMenu={menu} />;
}
