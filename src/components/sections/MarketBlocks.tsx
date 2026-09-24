import type { ReactNode } from "react";
import { BitcoinPanel } from "@/components/dashboard/BitcoinPanel";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { marketContent as staticMarketContent } from "@/data/content";
import { getMarketContent } from "@/services/content/siteContentService";
import { CryptoMarketGrid } from "./CryptoMarketGrid";

/**
 * Stessa scheda dell'area riservata (grafico disegnato in casa, non un
 * iframe): il visitatore vede lo stesso Bitcoin coerente con il resto del
 * sito prima ancora di registrarsi.
 */
export function FeaturedMarket() {
  return <BitcoinPanel currency="EUR" />;
}

export async function MarketBoard() {
  const marketContent = await getMarketContent();

  return (
    <>
      <SectionHeader
        id="asset-title"
        title={marketContent.title}
        description={marketContent.description}
        aside={
          <a
            href="https://www.coingecko.com/"
            target="_blank"
            rel="noopener nofollow"
            className="text-xs text-mist transition-colors hover:text-paper"
          >
            {staticMarketContent.credit}
          </a>
        }
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
