import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ETF Kompas – americké ETF, které z Česka opravdu koupíte",
  description:
    "VOO, SPY ani VTI si jako drobný investor z ČR nekoupíte. Ukážeme vám evropské ETF se stejným indexem, poplatky v korunách a postup nákupu.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#123b30",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="cs">
      <body className={`${bricolage.variable} ${plexMono.variable} antialiased`}>{children}</body>
    </html>
  );
}
