import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mensa Süd | Uni Rostock",
  description: "Daily lunch menu for Mensa Süd at University of Rostock",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
