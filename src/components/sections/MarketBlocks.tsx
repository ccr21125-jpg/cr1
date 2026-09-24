import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { TradingViewCredit } from "@/components/ui/TradingViewWidget";
import { getMarketContent } from "@/services/content/siteContentService";
import { BitcoinCard } from "./BitcoinCard";
import { CryptoMarketGrid } from "./CryptoMarketGrid";

/**
 * Le quotazioni arrivano dai widget TradingView lato client: qui non c'è
 * nessuna chiamata di rete dal server, quindi nessuno stato di errore o di
 * caricamento da gestire.
 */
export function FeaturedMarket() {
  return <BitcoinCard />;
}

export async function MarketBoard() {
  const marketContent = await getMarketContent();

  return (
    <>
      <SectionHeader
        id="asset-title"
        title={marketContent.title}
        description={marketContent.description}
        aside={<TradingViewCredit />}
      />
      <div className="mt-12">
        <CryptoMarketGrid />
      </div>
    </>
  );
}

export function MarketBoardShell({ children }: { children: ReactNode }) {
  return (
    <section aria-labelledby="asset-title" id="asset" className="py-24 sm:py-32">
      <Container>{children}</Container>
    </section>
  );
}
