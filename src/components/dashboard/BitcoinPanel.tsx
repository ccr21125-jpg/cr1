"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/icons/Icon";
import { FEATURED_ASSET } from "@/data/assets";
import { dashboardHome } from "@/data/content";
import { buildChartGeometry, CHART_VIEWBOX } from "@/lib/chart";
import { cn } from "@/lib/cn";
import { fetchCoinGecko } from "@/lib/coingecko";
import { FRESH_MS, readCache, STALE_MS, writeCache } from "@/lib/sessionCache";
import { formatAmount, formatCompact, formatPercent } from "@/lib/format";
import { useRates } from "./RatesProvider";
import { Shimmer } from "./Shimmer";

/** Ultime 24 ore: prezzi e relativi istanti, della stessa lunghezza. */
interface Series {
  prices: number[];
  times: number[];
}

/** Solo ciò che questa scheda chiede da sé: il grafico e la dominanza. */
type State =
  | { status: "loading" }
  | { status: "ready"; series: Series | null; dominance: number | null }
  | { status: "failed" };

/** Punti disegnati: il grafico a 24 ore ne restituisce ~288, uno ogni 5 minuti. */
const MAX_POINTS = 72;
/**
 * Scarto massimo tollerato fra l'ultimo punto del grafico e il prezzo corrente.
 * Le due chiamate arrivano dalla stessa fonte a pochi istanti di distanza: se i
 * valori divergono così tanto, non stanno misurando la stessa cosa (è successo
 * con una serie in dollari sotto un prezzo in euro). Meglio nessun grafico che
 * un asse dei prezzi sbagliato.
 */
const MAX_DRIFT = 0.1;

const CACHE_KEY = "btc-chart-v1";

/** Quel che questa scheda si ricorda fra un caricamento e l'altro. */
interface Snapshot {
  series: Series | null;
  dominance: number | null;
}

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

function clockLabel(ms: number): string {
  const date = new Date(ms);
  return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
}

async function readJson(response: Response | null): Promise<unknown> {
  return response?.ok ? response.json() : null;
}

/**
 * Prezzo del bitcoin, disegnato in casa invece che con un iframe.
 *
 * L'embed di TradingView portava con sé il proprio tema e le proprie
 * dimensioni, e restava un riquadro chiaro incollato dentro una scheda scura.
 * Qui i dati arrivano da CoinGecko e il grafico è un SVG che usa i colori del
 * sito, quindi la scheda è coerente con tutto il resto.
 *
 * La serie del grafico arriva da /market_chart e non dalla sparkline di
 * /coins/markets: quella ignora vs_currency e risponde sempre in dollari,
 * quindi l'asse mostrava cifre più alte del 15% circa rispetto al prezzo.
 *
 * Le richieste partono dal browser: CoinGecko rifiuta spesso gli IP dei
 * datacenter, Vercel compreso.
 */
export function BitcoinPanel({ currency = "EUR" }: { currency?: string }) {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();
    const vs = currency.toLowerCase();
    const get = (path: string) => fetchCoinGecko(path, { signal: controller.signal });

    (async () => {
      // Come per i cambi: un ricaricamento riparte da quello che già sapeva.
      const cached = readCache<Snapshot>(CACHE_KEY);
      const age = cached ? Date.now() - cached.t : Infinity;
      if (cached && age < STALE_MS) {
        await Promise.resolve();
        if (controller.signal.aborted) return;
        setState({ status: "ready", series: cached.value.series, dominance: cached.value.dominance });
        if (age < FRESH_MS) return;
      }

      try {
        /*
         * Prezzo, variazione, capitalizzazione, massimo, minimo e volume
         * arrivano dal contesto: li chiede RatesProvider una volta per tutta
         * la pagina. Qui restano solo le due richieste che servono a questa
         * scheda e a nessun altro — il grafico e la dominanza.
         */
        const [chartRes, globalRes] = await Promise.all([
          get(`/coins/bitcoin/market_chart?vs_currency=${vs}&days=1`).catch(() => null),
          get("/global").catch(() => null),
        ]);

        const chartBody = (await readJson(chartRes)) as { prices?: unknown } | null;
        const pairs = Array.isArray(chartBody?.prices)
          ? thin(
              chartBody.prices.filter(
                (pair): pair is [number, number] =>
                  Array.isArray(pair) && num(pair[0]) !== null && num(pair[1]) !== null,
              ),
              MAX_POINTS,
            )
          : [];

        const globalBody = (await readJson(globalRes)) as
          | { data?: { market_cap_percentage?: Record<string, unknown> } }
          | null;

        const snapshot: Snapshot = {
          series: pairs.length > 1 ? { times: pairs.map((p) => p[0]), prices: pairs.map((p) => p[1]) } : null,
          dominance: num(globalBody?.data?.market_cap_percentage?.btc),
        };
        writeCache<Snapshot>(CACHE_KEY, snapshot);
        setState({ status: "ready", ...snapshot });
      } catch (error) {
        if (!controller.signal.aborted && !cached) setState({ status: "failed" });
        void error;
      }
    })();

    return () => controller.abort();
  }, [currency]);

  const rates = useRates();
  const market = rates.status === "ready" ? rates.market : null;
  const dominance = state.status === "ready" ? state.dominance : null;

  /*
   * Il controllo di scarto confronta la serie del grafico con il prezzo
   * corrente. Quest'ultimo può arrivare da due chiamate diverse: si prende
   * quello dei dati di mercato, e in mancanza il cambio semplice — altrimenti
   * il fallimento di una richiesta che col grafico non c'entra nulla lo
   * farebbe sparire pur avendone i dati.
   */
  const reference = market?.price ?? (rates.status === "ready" ? rates.rates.eur : null);
  const raw = state.status === "ready" ? state.series : null;
  const last = raw?.prices.at(-1) ?? null;
  const drifted =
    raw === null ||
    reference === null ||
    last === null ||
    Math.abs(last - reference) / reference > MAX_DRIFT;
  const series = drifted ? null : raw;
  const geometry = series ? buildChartGeometry(series.prices) : null;
  // Cinque orari equidistanti, presi dagli istanti reali della serie.
  const timeLabels = series
    ? Array.from({ length: 5 }, (_, i) => series.times[Math.round((i * (series.times.length - 1)) / 4)])
        .filter((time): time is number => time !== undefined)
        .map(clockLabel)
    : [];
  const positive = (market?.change24h ?? 0) >= 0;
  const tint = FEATURED_ASSET.tint;

  return (
    <section className="panel overflow-hidden">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-line px-6 py-5">
        <div className="flex items-center gap-3.5">
          <span className="icon-tile grid size-10 shrink-0 place-items-center rounded-[var(--radius-card)]">
            <Icon name="chart" size={19} />
          </span>
          <div>
            <h2 className="font-wide font-semibold leading-tight text-paper">{dashboardHome.btcPanelTitle}</h2>
            <p className="text-sm text-mist">{dashboardHome.btcPanelSubtitle}</p>
          </div>
        </div>
        <a
          href="https://www.coingecko.com/"
          target="_blank"
          rel="noopener nofollow"
          className="text-xs text-mist transition-colors hover:text-paper"
        >
          {dashboardHome.btcPanelCredit}
        </a>
      </header>

      <div className="p-6">
        {state.status === "failed" && market === null ? (
          <p className="py-10 text-center text-sm text-mist">{dashboardHome.btcPanelUnavailable}</p>
        ) : (
          <>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
              <div>
                <dt className="text-[0.6875rem] font-medium uppercase tracking-[0.08em] text-mist">
                  {dashboardHome.btcCurrentPrice}
                </dt>
                <dd className="font-wide tabular mt-1 text-xl font-semibold text-paper">
                  {market ? formatAmount(market.price, currency) : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-[0.6875rem] font-medium uppercase tracking-[0.08em] text-mist">
                  {dashboardHome.btcChange}
                </dt>
                <dd
                  className={cn(
                    "font-wide tabular mt-1 text-xl font-semibold",
                    market ? (positive ? "text-mint" : "text-loss") : "text-paper",
                  )}
                >
                  {market ? `${positive ? "↑ +" : "↓ −"}${formatPercent(Math.abs(market.change24h))}` : "—"}
                </dd>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <dt className="text-[0.6875rem] font-medium uppercase tracking-[0.08em] text-mist">
                  {dashboardHome.btcMarketCap}
                </dt>
                <dd className="font-wide tabular mt-1 text-xl font-semibold text-paper">
                  {market ? formatCompact(market.marketCap, currency) : "—"}
                </dd>
              </div>
            </dl>

            <div className="relative mt-6 h-[220px] rounded-[var(--radius-card)] border border-line bg-panel-raised/40">
              {geometry ? (
                <>
                  {/* Griglia ed etichette in HTML: restano nitide mentre l'SVG si deforma */}
                  {geometry.ticks.map((tick) => (
                    <div
                      key={tick.topPercent}
                      className="pointer-events-none absolute inset-x-0 flex items-center"
                      style={{ top: `${tick.topPercent}%` }}
                    >
                      <span className="tabular w-[5.5rem] shrink-0 -translate-y-1/2 pl-3 text-[0.6875rem] text-mist/80">
                        {formatAmount(tick.value, currency)}
                      </span>
                      <span className="h-px flex-1 bg-line" />
                    </div>
                  ))}

                  <svg
                    viewBox={CHART_VIEWBOX}
                    preserveAspectRatio="none"
                    aria-label={dashboardHome.btcChartLabel}
                    role="img"
                    className="absolute inset-y-0 left-[5.5rem] right-0 h-full w-[calc(100%-5.5rem)]"
                  >
                    <defs>
                      <linearGradient id="btc-area" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={tint} stopOpacity="0.28" />
                        <stop offset="100%" stopColor={tint} stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path d={geometry.area} fill="url(#btc-area)" />
                    <path
                      d={geometry.line}
                      fill="none"
                      stroke={tint}
                      strokeWidth={1.75}
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      vectorEffect="non-scaling-stroke"
                      // Alone del colore della linea: la stacca dal fondo scuro
                      style={{ filter: `drop-shadow(0 0 5px ${tint}80)` }}
                    />
                  </svg>
                </>
              ) : (
                <div className="grid h-full place-items-center p-6">
                  {state.status === "loading" ? (
                    <Shimmer label={dashboardHome.btcPanelLoading} className="h-full w-full rounded-[var(--radius-card)]" />
                  ) : (
                    <p className="text-sm text-mist">{dashboardHome.btcPanelUnavailable}</p>
                  )}
                </div>
              )}
            </div>

            {geometry ? (
              <div className="ml-[5.5rem] mt-2 flex justify-between text-[0.6875rem] text-mist/80">
                {timeLabels.map((label, index) => (
                  <span key={`${label}-${index}`} className="tabular">
                    {label}
                  </span>
                ))}
              </div>
            ) : null}

            <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius-card)] border border-line bg-line sm:grid-cols-4">
              {[
                { label: dashboardHome.btcHigh, value: market ? formatAmount(market.high24h, currency) : "—" },
                { label: dashboardHome.btcLow, value: market ? formatAmount(market.low24h, currency) : "—" },
                { label: dashboardHome.btcVolume, value: market ? formatCompact(market.volume24h, currency) : "—" },
                {
                  label: dashboardHome.btcDominance,
                  value: dominance !== null ? formatPercent(dominance, 1) : "—",
                },
              ].map((item) => (
                <div key={item.label} data-row="" className="bg-panel p-4">
                  <dt className="text-[0.6875rem] font-medium uppercase tracking-[0.08em] text-mist">
                    {item.label}
                  </dt>
                  <dd className="tabular mt-1 text-[0.9375rem] text-paper">{item.value}</dd>
                </div>
              ))}
            </dl>
          </>
        )}
      </div>
    </section>
  );
}
