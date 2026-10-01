"use server";

import { revalidatePath } from "next/cache";
import { adminPage } from "@/data/content";
import { isPlausibleRate, parseAmountToCents } from "@/lib/money";
import { sanitizeText } from "@/lib/sanitize";
import { isSchemaMissing } from "@/lib/supabase/rpcError";
import { getAccount } from "@/services/account/accountService";
import { adjustBalance, decideWithdrawal, setAdmin, setDepositDetails, setWalletAddress } from "@/services/admin/adminService";

export interface AdminFormState {
  error?: string;
  success?: string;
}

/** Messaggio leggibile per ogni errore sollevato dalla funzione SQL. */
function messageForCode(code: string): string {
  // PostgREST risponde con i propri codici quando la funzione non è nella sua
  // cache dello schema: i codici SQL da soli non li intercettano.
  if (isSchemaMissing(code)) return adminPage.errors.migrationMissing;

  switch (code) {
    case "42501":
      return adminPage.errors.notAuthorised;
    case "23514":
      return adminPage.errors.constraint;
    case "55000":
      return adminPage.errors.alreadyDecided;
    case "P0002":
      return adminPage.errors.userNotFound;
    case "22003":
      return adminPage.errors.outOfRange;
    case "22023":
      return adminPage.errors.invalidInput;
    default:
      return `${adminPage.errors.generic} Codice: ${code}`;
  }
}

export async function adjustBalanceAction(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  // Prima barriera. Quella che conta davvero è dentro la funzione SQL,
  // che rifiuta la chiamata se chi la fa non è amministratore.
  const account = await getAccount();
  if (!account?.isAdmin) return { error: adminPage.errors.notAuthorised };

  const targetUserId = String(formData.get("user_id") ?? "");
  const direction = String(formData.get("direction") ?? "");
  const reason = sanitizeText(formData.get("reason"), 500);
  const amountCents = parseAmountToCents(String(formData.get("amount") ?? ""));

  if (!targetUserId) return { error: adminPage.errors.userNotFound };
  if (direction !== "credit" && direction !== "debit") return { error: adminPage.errors.invalidInput };
  if (amountCents === null || amountCents === 0) return { error: adminPage.errors.invalidAmount };
  if (!reason) return { error: adminPage.errors.reasonRequired };

  // Il cambio lo manda la pagina, che ce l'ha; il server lo verifica e
  // rifà la conversione da sé invece di fidarsi dei satoshi altrui.
  const rateCents = Number(formData.get("rate_eur_cents"));
  if (!Number.isFinite(rateCents) || !isPlausibleRate(rateCents / 100)) {
    return { error: adminPage.errors.rateMissing };
  }

  const delta = direction === "credit" ? amountCents : -amountCents;
  const result = await adjustBalance(targetUserId, delta, rateCents, reason);
  if (!result.ok) return { error: messageForCode(result.code) };

  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard");
  return { success: adminPage.adjustDone };
}

export async function setAdminAction(_prev: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const account = await getAccount();
  if (!account?.isAdmin) return { error: adminPage.errors.notAuthorised };

  const targetUserId = String(formData.get("user_id") ?? "");
  const makeAdmin = String(formData.get("make_admin") ?? "") === "true";
  if (!targetUserId) return { error: adminPage.errors.userNotFound };

  const result = await setAdmin(targetUserId, makeAdmin);
  if (!result.ok) return { error: messageForCode(result.code) };

  revalidatePath("/dashboard/admin");
  return { success: adminPage.roleDone };
}

/**
 * Imposta indirizzo BTC e coordinate bancarie che l'utente vedrà nel proprio
 * pannello di deposito. Prima barriera qui; quella che conta è dentro
 * `admin_set_deposit_details`, che rifiuta la chiamata se chi la fa non è
 * amministratore.
 */
export async function setDepositDetailsAction(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const account = await getAccount();
  if (!account?.isAdmin) return { error: adminPage.errors.notAuthorised };

  const targetUserId = String(formData.get("user_id") ?? "");
  if (!targetUserId) return { error: adminPage.errors.userNotFound };

  const result = await setDepositDetails(targetUserId, {
    btcAddress: sanitizeText(formData.get("btc_address"), 128),
    bankName: sanitizeText(formData.get("bank_name"), 200),
    bankIban: sanitizeText(formData.get("bank_iban"), 50),
    bankBic: sanitizeText(formData.get("bank_bic"), 20),
    bankHolder: sanitizeText(formData.get("bank_holder"), 200),
  });
  if (!result.ok) return { error: messageForCode(result.code) };

  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard");
  return { success: adminPage.depositDetailsDone };
}

/**
 * Imposta l'indirizzo del portafoglio che il cliente vede nella pagina
 * "Portafogli". È un dato a parte dai dati di deposito. Prima barriera qui;
 * quella che conta è dentro `admin_set_wallet_address`.
 */
export async function setWalletAddressAction(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const account = await getAccount();
  if (!account?.isAdmin) return { error: adminPage.errors.notAuthorised };

  const targetUserId = String(formData.get("user_id") ?? "");
  if (!targetUserId) return { error: adminPage.errors.userNotFound };

  const result = await setWalletAddress(targetUserId, sanitizeText(formData.get("wallet_address"), 128));
  if (!result.ok) return { error: messageForCode(result.code) };

  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/portafoglio");
  revalidatePath("/dashboard");
  return { success: adminPage.walletAddressDone };
}

/**
 * Approva o rifiuta una richiesta di prelievo.
 *
 * Approvare non muove il saldo: l'importo è stato trattenuto al momento della
 * richiesta. Rifiutare lo restituisce, e il motivo scritto qui è ciò che
 * l'utente legge nella propria pagina — per questo è obbligatorio.
 */
export async function decideWithdrawalAction(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  // Prima barriera. Quella che conta è dentro `admin_decide_withdrawal`.
  const account = await getAccount();
  if (!account?.isAdmin) return { error: adminPage.errors.notAuthorised };

  const id = String(formData.get("withdrawal_id") ?? "");
  const kind = String(formData.get("decision_kind") ?? "");
  const decision = sanitizeText(formData.get("decision"), 500);

  if (!id) return { error: adminPage.errors.userNotFound };
  if (kind !== "approve" && kind !== "reject") return { error: adminPage.errors.invalidInput };

  const approve = kind === "approve";
  if (!approve && !decision) return { error: adminPage.errors.decisionRequired };

  const result = await decideWithdrawal(id, approve, decision || null);
  if (!result.ok) return { error: messageForCode(result.code) };

  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/prelievi");
  revalidatePath("/dashboard");
  return { success: approve ? adminPage.approveDone : adminPage.rejectDone };
}
