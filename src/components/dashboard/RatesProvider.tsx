"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { fetchCoinGecko } from "@/lib/coingecko";
import { FRESH_MS, readCache, STALE_MS, writeCache } from "@/lib/sessionCache";

export interface Rates {
  /** Quanti euro/sterline/dollari vale un bitcoin. */
  eur: number;
  gbp: number;
  usd: number;
  /**
   * Variazione percentuale del prezzo negli ultimi 7 giorni, se disponibile.
   *
   * Da quando il conto è in bitcoin, è questa a muovere il controvalore che
   * l'utente vede: la somma dei movimenti del registro non basta più a
   * spiegare perché il saldo di ieri era diverso.
   */
  change7d: number | null;
}

/** Dati di mercato del bitcoin, chiesti una volta per tutta la pagina. */
export interface Market {
  price: number;
  change24h: number;
  marketCap: number;
  high24h: number;
  low24h: number;
  volume24h: number;
}

type RateState =
  | { status: "loading" }
  | { status: "ready"; rates: Rates; market: Market | null }
  | { status: "failed" };

const RatesContext = createContext<RateState>({ status: "loading" });

const RATE_PATH = "/simple/price?ids=bitcoin&vs_currencies=eur,gbp,usd";
/*
 * Un solo /coins/markets per l'intera pagina, con entrambe le variazioni.
 *
 * Prima ce n'erano due — uno qui per i 7 giorni e uno nella scheda del
 * bitcoin per le 24 ore — che differivano di un parametro. CoinGecko ne
 * accetta più d'uno separato da virgola, e l'API pubblica concede una decina
 * di chiamate al minuto per indirizzo: il doppione bastava, con un paio di
 * ricaricamenti, a farle rifiutare tutte.
 */
const MARKET_PATH = "/coins/markets?vs_currency=eur&ids=bitcoin&price_change_percentage=24h,7d";

const CACHE_KEY = "btc-rates-v1";

interface Snapshot {
  rates: Rates;
  market: Market | null;
}

function num(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function positive(source: Record<string, unknown>, key: string): number | null {
  const value = num(source[key]);
  return value !== null && value > 0 ? value : null;
}


/**
 * Cambi e dati di mercato del bitcoin, chiesti una volta sola e condivisi da
 * tutta la pagina.
 *
 * Le richieste partono dal browser del visitatore, non dal server: CoinGecko
 * rifiuta spesso gli IP dei datacenter, Vercel compreso. Se i cambi non
 * arrivano i componenti mostrano uno stato vuoto invece di un numero inventato.
 *
 * Il risultato resta nella memoria di sessione: un ricaricamento riparte dai
 * valori già noti invece di ripresentare dei trattini per il tempo della
 * richiesta, e non consuma una chiamata del budget.
 */
export function RatesProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<RateState>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      /*
       * La lettura della memoria avviene qui dentro, non nel corpo
       * dell'effetto: scrivere lo stato in modo sincrono lì dentro scatena un
       * secondo render a cascata prima che il primo sia finito, e la regola
       * react-hooks/set-state-in-effect lo segnala a ragione.
       */
      const cached = readCache<Snapshot>(CACHE_KEY);
      const age = cached ? Date.now() - cached.t : Infinity;

      // Abbastanza recente da mostrarlo subito: niente trattini all'apertura.
      if (cached && age < STALE_MS) {
        await Promise.resolve();
        if (controller.signal.aborted) return;
        setState({ status: "ready", rates: cached.value.rates, market: cached.value.market });
        if (age < FRESH_MS) return;
      }

      try {
        const [res, marketRes] = await Promise.all([
          fetchCoinGecko(RATE_PATH, { signal: controller.signal }),
          // I dati di mercato sono un di più: senza, i cambi restano validi.
          fetchCoinGecko(MARKET_PATH, { signal: controller.signal }).catch(() => null),
        ]);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const body: unknown = await res.json();
        const bitcoin =
          typeof body === "object" && body !== null
            ? (body as Record<string, Record<string, unknown>>).bitcoin
            : undefined;

        const eur = bitcoin ? positive(bitcoin, "eur") : null;
        const gbp = bitcoin ? positive(bitcoin, "gbp") : null;
        const usd = bitcoin ? positive(bitcoin, "usd") : null;
        if (eur === null || gbp === null || usd === null) throw new Error("cambi incompleti");

        let change7d: number | null = null;
        let market: Market | null = null;

        if (marketRes?.ok) {
          const rows: unknown = await marketRes.json();
          const row = Array.isArray(rows) ? (rows[0] as Record<string, unknown> | undefined) : undefined;
          if (row) {
            change7d = num(row.price_change_percentage_7d_in_currency);
            const price = num(row.current_price);
            const change24h = num(row.price_change_percentage_24h);
            if (price !== null && change24h !== null) {
              market = {
                price,
                change24h,
                marketCap: num(row.market_cap) ?? 0,
                high24h: num(row.high_24h) ?? 0,
                low24h: num(row.low_24h) ?? 0,
                volume24h: num(row.total_volume) ?? 0,
              };
            }
          }
        }

        const rates: Rates = { eur, gbp, usd, change7d };
        writeCache<Snapshot>(CACHE_KEY, { rates, market });
        setState({ status: "ready", rates, market });
      } catch (error) {
        // Un valore vecchio ma plausibile vale più di un trattino.
        if (!controller.signal.aborted && !cached) setState({ status: "failed" });
        void error;
      }
    })();

    return () => controller.abort();
  }, []);

  return <RatesContext value={state}>{children}</RatesContext>;
}

export function useRates(): RateState {
  return useContext(RatesContext);
}
