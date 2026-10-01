import "@fontsource-variable/mona-sans/wdth.css";
import "./globals.css";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { siteConfig } from "@/data/content";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — Piattaforma per i mercati crypto`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: siteConfig.ogLocale,
    url: "/",
    siteName: siteConfig.name,
    title: `${siteConfig.name} — Piattaforma per i mercati crypto`,
    description: siteConfig.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — Piattaforma per i mercati crypto`,
    description: siteConfig.description,
  },
  // Finché il sito è in fase dimostrativa non viene indicizzato
  robots: siteConfig.demoMode ? { index: false, follow: false } : { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#050807",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="it">
      <body>
        <a
          href="#contenuto"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-mint focus:px-4 focus:py-2 focus:text-ink"
        >
          Vai al contenuto
        </a>
        {children}
      </body>
    </html>
  );
}
