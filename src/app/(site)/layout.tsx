import type { ReactNode } from "react";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { RatesProvider } from "@/components/dashboard/RatesProvider";
import { getSiteName } from "@/services/content/siteContentService";

/**
 * Cornice del sito pubblico. L'area riservata ha la propria
 * (src/app/dashboard/layout.tsx) e non mostra navbar né footer.
 *
 * RatesProvider serve al grafico Bitcoin della homepage (BitcoinPanel, la
 * stessa scheda dell'area riservata): chiede il cambio una volta per pagina,
 * dal browser del visitatore, non dal server.
 */
export default async function SiteLayout({ children }: { children: ReactNode }) {
  const siteName = await getSiteName();

  return (
    <RatesProvider>
      <Navbar siteName={siteName} />
      <main id="contenuto" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <Footer siteName={siteName} />
    </RatesProvider>
  );
}
