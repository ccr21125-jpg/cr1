import "server-only";
import { mockStats, type PlatformStat } from "@/data/stats.mock";
import { getSiteContentFlat } from "./siteContentService";

const MAX_VALUE = 1e12;

/**
 * Legge il numero scritto dall'amministratore. Accetta "25000", "1,2", "1.2"
 * e anche "25.000" (punto come separatore delle migliaia). I decimali
 * mostrati sono quelli digitati. Un valore illeggibile non rompe la pagina:
 * resta il numero di partenza.
 */
function parseStatValue(raw: string | undefined, fallback: PlatformStat): { value: number; decimals: number } {
  const keep = { value: fallback.value, decimals: fallback.decimals };
  if (!raw) return keep;

  let text = raw.replace(/\s/g, "");
  if (/^\d{1,3}(\.\d{3})+(,\d+)?$/.test(text)) text = text.replace(/\./g, "");
  text = text.replace(",", ".");
  if (!/^\d+(\.\d+)?$/.test(text)) return keep;

  const value = Number(text);
  if (!Number.isFinite(value) || value > MAX_VALUE) return keep;
  return { value, decimals: text.split(".")[1]?.length ?? 0 };
}

/**
 * L'unità va attaccata al numero senza andare a capo: "Mld $" diventa
 * "\u00a0Mld\u00a0$", mentre "%" e "+" restano subito dopo il numero.
 */
function formatSuffix(raw: string): string {
  const text = raw.trim();
  if (!text) return "";
  const body = text.replace(/ /g, "\u00a0");
  return /^[\p{L}$€£]/u.test(text) ? `\u00a0${body}` : body;
}

/** Statistiche della homepage: i valori di partenza di stats.mock.ts, sovrascritti da quelli salvati dall'amministratore. */
export async function getPlatformStats(): Promise<PlatformStat[]> {
  const flat = await getSiteContentFlat("stats");

  return mockStats.map((s) => {
    const { value, decimals } = parseStatValue(flat[`${s.id}_value`], s);
    const suffixKey = `${s.id}_suffix`;
    const demoSaved = flat[`${s.id}_demo`];

    return {
      id: s.id,
      label: flat[`${s.id}_label`] || s.label,
      value,
      decimals,
      prefix: s.prefix,
      // Un'unità lasciata vuota è una scelta (nessuna unità), non un campo non toccato
      suffix: suffixKey in flat ? formatSuffix(flat[suffixKey]!) : s.suffix,
      isDemo: demoSaved === undefined ? s.isDemo : demoSaved === "true",
      source: flat[`${s.id}_source`] || s.source,
    };
  });
}
