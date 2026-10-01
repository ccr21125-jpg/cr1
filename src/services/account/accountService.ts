import "server-only";
import { logRpcError } from "@/lib/supabase/rpcError";
import { cache } from "react";
import { createSupabaseServerClient, getCurrentUser } from "@/lib/supabase/server";
import type { AccountUser, BankDetails, LedgerEntry } from "./types";

function readString(value: unknown): string | null {
  return typeof value === "string" && value.trim() !== "" ? value : null;
}

/** null solo se NESSUNA delle coordinate è impostata: altrimenti si mostra ciò che c'è. */
function readBankDetails(row: {
  bank_name?: unknown;
  bank_iban?: unknown;
  bank_bic?: unknown;
  bank_account_holder?: unknown;
}): BankDetails | null {
  const name = readString(row.bank_name);
  const iban = readString(row.bank_iban);
  const bic = readString(row.bank_bic);
  const holder = readString(row.bank_account_holder);
  if (!name && !iban && !bic && !holder) return null;
  return { name, iban, bic, holder };
}

/** I centesimi salvati nel database diventano euro solo per essere mostrati. */
export function centsToUnits(cents: number | null | undefined): number {
  return typeof cents === "number" ? cents / 100 : 0;
}

/** Un intero di satoshi, o zero: mai NaN, mai un decimale. */
export function readSats(value: number | null | undefined): number {
  return typeof value === "number" && Number.isFinite(value) ? Math.trunc(value) : 0;
}

/**
 * Traduce l'utente Supabase nella struttura usata dall'area riservata.
 *
 * Saldo e ruolo arrivano dalla tabella `profiles`, non da `user_metadata`:
 * quest'ultimo è modificabile dall'utente stesso via API, quindi non può
 * decidere né quanto denaro ha né se è amministratore.
 *
 * Se la tabella non c'è ancora (migrazione non eseguita) si ripiega sui dati
 * anagrafici di `user_metadata` con `profileReady: false`, così il sito
 * continua a funzionare e l'interfaccia può dirlo apertamente.
 */
export const getAccount = cache(async (): Promise<AccountUser | null> => {
  const user = await getCurrentUser();
  if (!user) return null;

  const meta = user.user_metadata ?? {};
  const email = user.email ?? "";
  const metaFirstName = readString(meta.first_name);

  const supabase = await createSupabaseServerClient();
  const { data: profile, error } = await supabase
    .from("profiles")
    .select(
      "first_name, last_name, phone, city, balance_sats, currency, is_admin, declared_amount_cents, btc_address, bank_name, bank_iban, bank_bic, bank_account_holder",
    )
    .eq("id", user.id)
    .maybeSingle();

  /*
   * L'errore veniva scartato nella destrutturazione: qualunque guasto
   * diventava "profilo assente", e l'interfaccia diceva sempre di eseguire
   * la prima migrazione — anche quando quella c'era e a mancare era una
   * colonna aggiunta da una successiva. Il codice serve a dire quale.
   */
  const profileError = error ? logRpcError("select profiles", error) : null;

  if (!profile) {
    return {
      id: user.id,
      username: readString(meta.full_name) ?? metaFirstName ?? email.split("@")[0] ?? "",
      email,
      firstName: metaFirstName,
      lastName: readString(meta.last_name),
      phone: readString(meta.phone),
      city: readString(meta.city),
      balanceSats: 0,
      currency: "EUR",
      walletAddress: null,
      depositBtcAddress: null,
      bankDetails: null,
      declaredAmount: typeof meta.amount === "number" ? meta.amount : null,
      isAdmin: false,
      profileReady: false,
      profileError,
    };
  }

  /*
   * L'indirizzo del portafoglio sta in una colonna della migrazione 0008, letta
   * a parte e senza far fallire nulla: se quella migrazione non è ancora stata
   * eseguita, l'area riservata funziona lo stesso e il portafoglio risulta
   * semplicemente "non ancora assegnato".
   */
  const { data: walletRow } = await supabase
    .from("profiles")
    .select("wallet_address")
    .eq("id", user.id)
    .maybeSingle();

  const firstName = readString(profile.first_name) ?? metaFirstName;
  const lastName = readString(profile.last_name) ?? readString(meta.last_name);
  const fullName = [firstName, lastName].filter(Boolean).join(" ");

  return {
    id: user.id,
    username: fullName || email.split("@")[0] || "",
    email,
    firstName,
    lastName,
    phone: readString(profile.phone),
    city: readString(profile.city),
    balanceSats: readSats(profile.balance_sats),
    currency: "EUR",
    walletAddress: readString(walletRow?.wallet_address),
    depositBtcAddress: readString(profile.btc_address),
    bankDetails: readBankDetails(profile),
    declaredAmount:
      typeof profile.declared_amount_cents === "number" ? centsToUnits(profile.declared_amount_cents) : null,
    isAdmin: profile.is_admin === true,
    profileReady: true,
    profileError: null,
  };
});

/**
 * Movimenti dell'utente corrente. Le policy RLS restituiscono solo le righe
 * che gli appartengono, quindi qui non serve filtrare.
 */
export async function getOwnLedger(limit = 10): Promise<LedgerEntry[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("ledger_entries")
    .select("id, amount_sats, balance_after_sats, rate_eur_cents, reason, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    amountSats: readSats(row.amount_sats),
    balanceAfterSats: readSats(row.balance_after_sats),
    rateEurCents: typeof row.rate_eur_cents === "number" ? row.rate_eur_cents : null,
    reason: row.reason ?? "",
    createdAt: row.created_at ?? "",
  }));
}

