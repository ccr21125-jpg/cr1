"use client";

import { useEffect, useState } from "react";
import { CoinMark } from "@/components/ui/CoinMark";
import { Shimmer } from "@/components/dashboard/Shimmer";
import { assetRegistry, type AssetDefinition } from "@/data/assets";
import { marketContent } from "@/data/content";
import { buildChartGeometry, CHART_VIEWBOX } from "@/lib/chart";
import { cn } from "@/lib/cn";
import { formatAmount, formatPercent } from "@/lib/format";
import { FRESH_MS, readCache, STALE_MS, writeCache } from "@/lib/sessionCache";

const API = "https://api.coingecko.com/api/v3";
const IDS = assetRegistry.map((a) => a.providerId).join(",");
const MARKET_URL = `${API}/coins/markets?vs_currency=eur&ids=${IDS}&price_change_percentage=24h`;
/** Meno punti che nella scheda in evidenza: qui il grafico è alto un terzo. */
const MAX_POINTS = 48;
/** Stesso scarto di sicurezza di BitcoinPanel: v. quel file per il perché. */
const MAX_DRIFT = 0.1;
const MARKET_CACHE_KEY = "grid-market-v1";

interface MarketRow {
  price: number;
  change24h: number;
}

type MarketState =
  | { status: "loading" }
  | { status: "ready"; rows: Record<string, MarketRow> }
  | { status: "failed" };

function num(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

/** Riduce i punti mantenendo esattamente il primo e l'ultimo. */
function thin<T>(items: T[], max: number): T[] {
  if (items.length <= max) return items;
  const step = (items.length - 1) / (max - 1);
  const kept: T[] = [];
  for (let i = 0; i < max; i += 1) {
    const item = items[Math.round(i * step)];
    if (item !== undefined) kept.push(item);
  }
  return kept;
}

/**
 * "Quote board": su mobile carosello orizzontale con snap,
 * da sm in su griglia unica con divisori da 1px (gap-px su fondo bg-line).
 *
 * Stessa filosofia della scheda BTC in evidenza (BitcoinPanel): grafico
 * disegnato in casa con dati CoinGecko, non un iframe di terzi. Il prezzo e
 * la variazione di tutti gli asset arrivano da UNA sola chiamata a
 * `/coins/markets` (l'endpoint accetta più id insieme); il grafico di ogni
 * scheda resta una chiamata a testa, perché `/market_chart` non è cumulativo.
 */
export function CryptoMarketGrid() {
  const [state, setState] = useState<MarketState>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      const cached = readCache<Record<string, MarketRow>>(MARKET_CACHE_KEY);
      const age = cached ? Date.now() - cached.t : Infinity;
      if (cached && age < STALE_MS) {
        await Promise.resolve();
        if (controller.signal.aborted) return;
        setState({ status: "ready", rows: cached.value });
        if (age < FRESH_MS) return;
      }

      try {
        const res = await fetch(MARKET_URL, { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const body: unknown = await res.json();

        const rows: Record<string, MarketRow> = {};
        if (Array.isArray(body)) {
          for (const entry of body as Record<string, unknown>[]) {
            const id = typeof entry.id === "string" ? entry.id : null;
            const price = num(entry.current_price);
            const change24h = num(entry.price_change_percentage_24h);
            if (id && price !== null && change24h !== null) rows[id] = { price, change24h };
          }
        }

        writeCache(MARKET_CACHE_KEY, rows);
        setState({ status: "ready", rows });
      } catch (error) {
        if (!controller.signal.aborted && !cached) setState({ status: "failed" });
        void error;
      }
    })();

    return () => controller.abort();
  }, []);

  const rows = state.status === "ready" ? state.rows : {};

  return (
    <div
      role="region"
      aria-label="Elenco asset, scorrevole orizzontalmente su schermi piccoli"
      tabIndex={0}
      className="scrollbar-none -mx-5 overflow-x-auto px-5 sm:mx-0 sm:overflow-visible sm:px-0"
    >
      <ul
        className="flex snap-x snap-mandatory gap-3 sm:grid sm:snap-none sm:grid-cols-2 sm:gap-px sm:overflow-hidden sm:rounded-[var(--radius-panel)] sm:border sm:border-line sm:bg-line lg:grid-cols-3"
      >
        {assetRegistry.map((asset) => (
          <li
            key={asset.providerId}
            className="relative w-[78%] shrink-0 snap-start rounded-[var(--radius-card)] border border-line bg-panel p-5 transition-colors duration-200 hover:bg-panel-raised min-[480px]:w-[60%] sm:w-auto sm:rounded-none sm:border-0 sm:p-6"
          >
            <AssetCard asset={asset} market={rows[asset.providerId] ?? null} marketLoading={state.status === "loading"} />
          </li>
        ))}
      </ul>
    </div>
  );
}

interface Series {
  prices: number[];
}

type ChartState = { status: "loading" } | { status: "ready"; series: Series | null } | { status: "failed" };

function AssetCard({
  asset,
  market,
  marketLoading,
}: {
  asset: AssetDefinition;
  market: MarketRow | null;
  marketLoading: boolean;
}) {
  const [chart, setChart] = useState<ChartState>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();
    const cacheKey = `grid-chart-${asset.providerId}-v1`;

    (async () => {
      const cached = readCache<Series | null>(cacheKey);
      const age = cached ? Date.now() - cached.t : Infinity;
      if (cached && age < STALE_MS) {
        await Promise.resolve();
        if (controller.signal.aborted) return;
        setChart({ status: "ready", series: cached.value });
        if (age < FRESH_MS) return;
      }

      try {
        const res = await fetch(`${API}/coins/${asset.providerId}/market_chart?vs_currency=eur&days=1`, {
          signal: controller.signal,
        });
        const body = res.ok ? ((await res.json()) as { prices?: unknown }) : null;
        const pairs = Array.isArray(body?.prices)
          ? thin(
              body.prices.filter(
                (pair): pair is [number, number] =>
                  Array.isArray(pair) && num(pair[0]) !== null && num(pair[1]) !== null,
              ),
              MAX_POINTS,
            )
          : [];
        const series = pairs.length > 1 ? { prices: pairs.map((p) => p[1]) } : null;
        writeCache(cacheKey, series);
        setChart({ status: "ready", series });
      } catch (error) {
        if (!controller.signal.aborted && !cached) setChart({ status: "failed" });
        void error;
      }
    })();

    return () => controller.abort();
  }, [asset.providerId]);

  // Stesso controllo di scarto di BitcoinPanel: un grafico da una fonte che
  // non concorda col prezzo mostrato è peggio di nessun grafico.
  const raw = chart.status === "ready" ? chart.series : null;
  const last = raw?.prices.at(-1) ?? null;
  const drifted = raw === null || market === null || last === null || Math.abs(last - market.price) / market.price > MAX_DRIFT;
  const series = drifted ? null : raw;
  const geometry = series ? buildChartGeometry(series.prices) : null;
  const positive = (market?.change24h ?? 0) >= 0;
  const gradientId = `grid-area-${asset.providerId}`;

  return (
    <article aria-labelledby={`asset-${asset.providerId}`}>
      <div className="flex items-center gap-3">
        <CoinMark symbol={asset.symbol} tint={asset.tint} />
        <div className="min-w-0 flex-1">
          <h3 id={`asset-${asset.providerId}`} className="truncate font-medium leading-tight text-paper">
            {asset.name}
          </h3>
          <p className="text-sm text-mist">{asset.symbol}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="tabular font-wide font-semibold text-paper">
            {market ? formatAmount(market.price, "EUR") : "—"}
          </p>
          <p className={cn("tabular text-xs font-medium", market ? (positive ? "text-mint" : "text-loss") : "text-mist")}>
            {market ? `${positive ? "↑ +" : "↓ −"}${formatPercent(Math.abs(market.change24h))}` : "—"}
          </p>
        </div>
      </div>

      <div className="relative mt-4 h-[100px]">
        {geometry ? (
          <svg viewBox={CHART_VIEWBOX} preserveAspectRatio="none" aria-hidden="true" className="h-full w-full">
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={asset.tint} stopOpacity="0.28" />
                <stop offset="100%" stopColor={asset.tint} stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={geometry.area} fill={`url(#${gradientId})`} />
            <path
              d={geometry.line}
              fill="none"
              stroke={asset.tint}
              strokeWidth={1.75}
              strokeLinejoin="round"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        ) : (
          <div className="grid h-full place-items-center">
            {marketLoading || chart.status === "loading" ? (
              <Shimmer label={marketContent.chartLoading} className="h-full w-full rounded-[var(--radius-card)]" />
            ) : (
              <p className="text-xs text-mist">{marketContent.chartUnavailable}</p>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
