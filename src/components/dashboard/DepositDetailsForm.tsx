"use client";

import { useActionState } from "react";
import { setDepositDetailsAction } from "@/app/dashboard/admin/actions";
import { Field } from "@/components/auth/Field";
import { Button } from "@/components/ui/Button";
import { adminPage } from "@/data/content";
import type { BankDetails } from "@/services/account/types";

/**
 * Indirizzo BTC e coordinate bancarie che l'utente vedrà nel proprio pannello
 * di deposito. Sono solo dati da mostrare: nessun saldo si muove da qui, il
 * credito resta un movimento a parte fatto con "Accredita" una volta arrivato
 * il versamento.
 */
export function DepositDetailsForm({
  userId,
  btcAddress,
  bankDetails,
}: {
  userId: string;
  btcAddress: string | null;
  bankDetails: BankDetails | null;
}) {
  const [state, formAction, pending] = useActionState(setDepositDetailsAction, {});

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="user_id" value={userId} />
      <p className="text-sm font-medium text-paper">{adminPage.depositDetailsTitle}</p>

      <Field
        name="btc_address"
        id={`btc-address-${userId}`}
        label={adminPage.btcAddressLabel}
        defaultValue={btcAddress ?? ""}
        placeholder={adminPage.btcAddressPlaceholder}
        maxLength={128}
        autoComplete="off"
        spellCheck={false}
        disabled={pending}
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <Field
          name="bank_name"
          id={`bank-name-${userId}`}
          label={adminPage.bankNameLabel}
          defaultValue={bankDetails?.name ?? ""}
          placeholder={adminPage.bankNamePlaceholder}
          maxLength={200}
          disabled={pending}
        />
        <Field
          name="bank_iban"
          id={`bank-iban-${userId}`}
          label={adminPage.bankIbanLabel}
          defaultValue={bankDetails?.iban ?? ""}
          placeholder={adminPage.bankIbanPlaceholder}
          maxLength={50}
          autoComplete="off"
          spellCheck={false}
          disabled={pending}
        />
        <Field
          name="bank_bic"
          id={`bank-bic-${userId}`}
          label={adminPage.bankBicLabel}
          defaultValue={bankDetails?.bic ?? ""}
          placeholder={adminPage.bankBicPlaceholder}
          maxLength={20}
          autoComplete="off"
          spellCheck={false}
          disabled={pending}
        />
        <Field
          name="bank_holder"
          id={`bank-holder-${userId}`}
          label={adminPage.bankHolderLabel}
          defaultValue={bankDetails?.holder ?? ""}
          placeholder={adminPage.bankHolderPlaceholder}
          maxLength={200}
          disabled={pending}
        />
      </div>

      {state.error ? (
        <p role="alert" className="text-sm text-loss">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p role="status" className="text-sm text-mint">
          {state.success}
        </p>
      ) : null}

      <Button type="submit" variant="secondary" size="sm" disabled={pending}>
        {pending ? adminPage.pending : adminPage.saveDepositDetails}
      </Button>
    </form>
  );
}
