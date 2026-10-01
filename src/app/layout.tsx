import "@fontsource-variable/mona-sans/wdth.css";
import "./globals.css";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { siteConfig } from "@/data/content";
import { getSiteName } from "@/services/content/siteContentService";

/** Metadati generati a richiesta: il nome del sito lo sceglie l'amministratore, non il codice. */
export async function generateMetadata(): Promise<Metadata> {
  const name = await getSiteName();
  const title = `${name} — Piattaforma per i mercati crypto`;

  return {
    metadataBase: new URL(siteConfig.url),
    title: { default: title, template: `%s | ${name}` },
    description: siteConfig.description,
    applicationName: name,
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      locale: siteConfig.ogLocale,
      url: "/",
      siteName: name,
      title,
      description: siteConfig.description,
    },
    twitter: { card: "summary_large_image", title, description: siteConfig.description },
    // Finché il sito è in fase dimostrativa non viene indicizzato
    robots: siteConfig.demoMode ? { index: false, follow: false } : { index: true, follow: true },
  };
}

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
