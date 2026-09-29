/**
 * fetch condiviso verso CoinGecko, con un tentativo di ripetizione su 429.
 *
 * L'API pubblica, senza una chiave, applica un limite basso e sensibile alle
 * richieste simultanee: la homepage arriva a farne una decina nello stesso
 * istante (RatesProvider, BitcoinPanel, la griglia asset e le sue schede), e
 * bastano per far rifiutare qualcuna con 429. Senza un secondo tentativo,
 * quella richiesta restava fallita per tutta la visita — da qui il grafico
 * "non disponibile" anche quando il prezzo esiste per davvero.
 *
 * La chiave demo di CoinGecko è gratuita e alza parecchio il limite: se
 * impostata in NEXT_PUBLIC_COINGECKO_API_KEY viene inviata automaticamente,
 * altrimenti si resta sul livello anonimo.
 */
export const COINGECKO_API = "https://api.coingecko.com/api/v3";

function apiKeyHeaders(): HeadersInit {
  const key = process.env.NEXT_PUBLIC_COINGECKO_API_KEY;
  return key ? { "x-cg-demo-api-key": key } : {};
}

export function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("aborted", "AbortError"));
      return;
    }
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        reject(new DOMException("aborted", "AbortError"));
      },
      { once: true },
    );
  });
}

export async function fetchCoinGecko(path: string, init?: RequestInit): Promise<Response> {
  const headers = { ...apiKeyHeaders(), ...(init?.headers ?? {}) };
  const res = await fetch(`${COINGECKO_API}${path}`, { ...init, headers });
  if (res.status !== 429) return res;

  // Una sola ripetizione, dopo una pausa breve: l'API torna disponibile
  // quasi subito una volta passato il picco di richieste simultanee.
  await sleep(1200, init?.signal ?? undefined);
  return fetch(`${COINGECKO_API}${path}`, { ...init, headers });
}

/**
 * Attesa prima di una richiesta, proporzionale alla posizione nell'elenco:
 * evita che N schede montate insieme sparino N richieste nello stesso
 * istante. Ogni scheda aspetta il proprio turno invece di tentare e sperare.
 */
export function staggerDelay(index: number, stepMs = 350): number {
  return index * stepMs;
}
