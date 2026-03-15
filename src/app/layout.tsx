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
    "Create and share your Top 10 Prince songs for the 10-year anniversary of Prince's passing. Generate a beautiful shareable graphic instantly.",
  openGraph: {
    title: "#My10PrinceSongs",
    description:
      "What are your Top 10 Prince songs? Create a shareable graphic and celebrate the legacy of Prince.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "#My10PrinceSongs",
    description:
      "What are your Top 10 Prince songs? Create a shareable graphic and celebrate the legacy of Prince.",
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
