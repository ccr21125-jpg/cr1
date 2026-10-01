"use client";

import { useActionState } from "react";
import { setWalletAddressAction } from "@/app/dashboard/admin/actions";
import { Field } from "@/components/auth/Field";
import { Button } from "@/components/ui/Button";
import { adminPage } from "@/data/content";

/**
 * Indirizzo del portafoglio di un cliente, quello che vede nella pagina
 * "Portafogli". Non c'entra con i dati di deposito: sono due moduli e due
 * colonne diverse, perché sono due cose diverse.
 */
export function WalletAddressForm({ userId, walletAddress }: { userId: string; walletAddress: string | null }) {
  const [state, formAction, pending] = useActionState(setWalletAddressAction, {});

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="user_id" value={userId} />
      <div>
        <p className="text-sm font-medium text-paper">{adminPage.walletAddressTitle}</p>
        <p className="mt-1 text-xs text-mist">{adminPage.walletAddressHint}</p>
      </div>

      <Field
        name="wallet_address"
        id={`wallet-address-${userId}`}
        label={adminPage.walletAddressLabel}
        defaultValue={walletAddress ?? ""}
        placeholder={adminPage.walletAddressPlaceholder}
        maxLength={128}
        autoComplete="off"
        spellCheck={false}
        disabled={pending}
      />

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
        {pending ? adminPage.pending : adminPage.saveWalletAddress}
      </Button>
    </form>
  );
}
