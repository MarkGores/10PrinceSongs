import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600"],
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "700", "900"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "#My10PrinceSongs - Share Your Top 10 Prince Songs",
  description:
    "What are your Top 10 Prince songs? Create and share a beautiful graphic for the 10-year anniversary. April 21, 2026.",
  openGraph: {
    title: "#My10PrinceSongs",
    description:
      "Everyone's got their 10. What are yours? Create a shareable graphic and celebrate the legacy of Prince.",
    type: "website",
    siteName: "My 10 Prince Songs",
  },
  twitter: {
    card: "summary_large_image",
    title: "#My10PrinceSongs",
    description:
      "Everyone's got their 10. What are yours? Create a shareable graphic and celebrate the legacy of Prince.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-[family-name:var(--font-inter)]">{children}</body>
    </html>
  );
}
