import "server-only";
import { logRpcError } from "@/lib/supabase/rpcError";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { readSats } from "@/services/account/accountService";
import type { AdminUserRow, AdminWithdrawal, LedgerEntry } from "@/services/account/types";
import { toWithdrawal, WITHDRAWAL_COLUMNS } from "@/services/account/withdrawalService";

/**
 * Elenco completo degli utenti.
 *
 * Non serve filtrare per ruolo: le policy RLS restituiscono tutte le righe
 * solo a chi è amministratore, e a chiunque altro soltanto la propria. Il
 * database è l'ultima parola, non questa funzione.
 */
export async function listUsers(): Promise<AdminUserRow[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, email, first_name, last_name, phone, city, balance_sats, currency, is_admin, created_at, btc_address, bank_name, bank_iban, bank_bic, bank_account_holder",
    )
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  // Colonna della migrazione 0008, letta a parte: se manca, l'elenco resta com'era.
  const { data: walletRows } = await supabase.from("profiles").select("id, wallet_address");
  const walletById = new Map<string, string | null>(
    (walletRows ?? []).map((r) => [r.id as string, (r.wallet_address as string | null) ?? null]),
  );

  return data.map((row) => {
    const fullName = [row.first_name, row.last_name].filter(Boolean).join(" ");
    const name = row.bank_name ?? null;
    const iban = row.bank_iban ?? null;
    const bic = row.bank_bic ?? null;
    const holder = row.bank_account_holder ?? null;
    return {
      id: row.id,
      email: row.email ?? "",
      fullName: fullName || null,
      phone: row.phone ?? null,
      city: row.city ?? null,
      balanceSats: readSats(row.balance_sats),
      currency: row.currency ?? "EUR",
      isAdmin: row.is_admin === true,
      createdAt: row.created_at ?? "",
      walletAddress: walletById.get(row.id) ?? null,
      depositBtcAddress: row.btc_address ?? null,
      bankDetails: name || iban || bic || holder ? { name, iban, bic, holder } : null,
    };
  });
}

/**
 * Imposta indirizzo BTC e/o coordinate bancarie di un utente, per il pannello
 * di deposito che quell'utente vede. Il lavoro vero è nella funzione SQL, che
 * verifica da sé che chi chiama sia amministratore.
 */
export async function setDepositDetails(
  targetUserId: string,
  details: { btcAddress: string; bankName: string; bankIban: string; bankBic: string; bankHolder: string },
): Promise<{ ok: true } | { ok: false; code: string }> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("admin_set_deposit_details", {
    target_user: targetUserId,
    btc_address: details.btcAddress,
    bank_name: details.bankName,
    bank_iban: details.bankIban,
    bank_bic: details.bankBic,
    bank_account_holder: details.bankHolder,
  });

  if (error) return { ok: false, code: logRpcError("admin_set_deposit_details", error) };
  return { ok: true };
}

/**
 * Imposta l'indirizzo del portafoglio di un cliente. Il lavoro vero è nella
 * funzione SQL, che verifica da sé che chi chiama sia amministratore.
 */
export async function setWalletAddress(
  targetUserId: string,
  address: string,
): Promise<{ ok: true } | { ok: false; code: string }> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("admin_set_wallet_address", {
    target_user: targetUserId,
    new_wallet_address: address,
  });

  if (error) return { ok: false, code: logRpcError("admin_set_wallet_address", error) };
  return { ok: true };
}

/** Ultimi movimenti registrati, di tutti gli utenti. */
export async function listRecentLedger(limit = 20): Promise<(LedgerEntry & { userId: string })[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("ledger_entries")
    .select("id, user_id, amount_sats, balance_after_sats, rate_eur_cents, reason, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    userId: row.user_id,
    amountSats: readSats(row.amount_sats),
    balanceAfterSats: readSats(row.balance_after_sats),
    rateEurCents: typeof row.rate_eur_cents === "number" ? row.rate_eur_cents : null,
    reason: row.reason ?? "",
    createdAt: row.created_at ?? "",
  }));
}

/**
 * Accredito o addebito. Il lavoro vero lo fa `admin_adjust_balance` nel
 * database: aggiorna il saldo e scrive il registro in un'unica transazione,
 * e verifica da sé che chi chiama sia un amministratore.
 */
export async function adjustBalance(
  targetUserId: string,
  deltaCents: number,
  rateEurCents: number,
  reason: string,
): Promise<{ ok: true; balanceSats: number } | { ok: false; code: string }> {
  const supabase = await createSupabaseServerClient();
  // L'amministratore ragiona in euro, il conto vive in satoshi: la
  // conversione la fa il database, con il cambio che la pagina gli passa e
  // di cui verifica la plausibilità prima di usarlo.
  const { data, error } = await supabase.rpc("admin_adjust_balance", {
    target_user: targetUserId,
    delta_cents: deltaCents,
    rate_eur_cents: rateEurCents,
    adjust_reason: reason,
  });

  if (error) return { ok: false, code: logRpcError("admin_adjust_balance", error) };
  return { ok: true, balanceSats: readSats(typeof data === "number" ? data : 0) };
}

/** Promuove o revoca un amministratore, sempre passando dal database. */
export async function setAdmin(
  targetUserId: string,
  makeAdmin: boolean,
): Promise<{ ok: true } | { ok: false; code: string }> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("admin_set_admin", {
    target_user: targetUserId,
    make_admin: makeAdmin,
  });

  if (error) return { ok: false, code: logRpcError("admin_set_admin", error) };
  return { ok: true };
}

/**
 * Tutte le richieste di prelievo, con l'utente accanto.
 *
 * L'utente arriva da una join su `profiles`: senza, il pannello mostrerebbe
 * un UUID. Le policy RLS restituiscono l'elenco completo solo a chi è
 * amministratore; a chiunque altro, soltanto le proprie righe.
 */
export async function listWithdrawals(limit = 100): Promise<AdminWithdrawal[] | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("withdrawals")
    .select(`${WITHDRAWAL_COLUMNS}, profiles!withdrawals_user_id_fkey (email, first_name, last_name)`)
    .order("created_at", { ascending: false })
    .limit(limit);

  // null, non []: una tabella mancante non è "nessuna richiesta di prelievo".
  if (error) {
    logRpcError("select withdrawals (admin)", error);
    return null;
  }

  return (data ?? []).map((row) => {
    // La join arriva come oggetto o come array di uno, a seconda di come
    // PostgREST deduce la cardinalità: normalizzata qui una volta sola.
    const joined = row.profiles as
      | { email: string | null; first_name: string | null; last_name: string | null }
      | { email: string | null; first_name: string | null; last_name: string | null }[]
      | null;
    const profile = Array.isArray(joined) ? joined[0] : joined;
    const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ");

    return {
      ...toWithdrawal(row),
      userId: row.user_id,
      userEmail: profile?.email ?? "",
      userName: fullName || null,
      decidedBy: row.decided_by ?? null,
    };
  });
}

/**
 * Approva o rifiuta. Il saldo lo muove la funzione SQL, che blocca la riga
 * prima di leggerne lo stato: due amministratori sulla stessa richiesta si
 * mettono in fila, e il secondo riceve "già evasa" invece di sovrascrivere
 * la decisione del primo.
 */
export async function decideWithdrawal(
  id: string,
  approve: boolean,
  decision: string | null,
): Promise<{ ok: true; status: string } | { ok: false; code: string }> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("admin_decide_withdrawal", {
    withdrawal_id: id,
    approve,
    decision,
  });

  if (error) return { ok: false, code: logRpcError("admin_decide_withdrawal", error) };
  return { ok: true, status: typeof data === "string" ? data : "" };
}

/**
 * Salva il testo di una sezione della homepage. Il lavoro vero è nella
 * funzione SQL, che verifica da sé che chi chiama sia amministratore e
 * sostituisce l'intero contenuto della sezione, non un campo alla volta.
 */
export async function setSiteContent(
  sectionKey: string,
  data: Record<string, unknown>,
): Promise<{ ok: true } | { ok: false; code: string }> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("admin_set_site_content", {
    target_section: sectionKey,
    content_data: data,
  });

  if (error) return { ok: false, code: logRpcError("admin_set_site_content", error) };
  return { ok: true };
}
