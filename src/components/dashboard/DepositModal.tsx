"use client";

import { useState } from "react";
import { Icon } from "@/components/icons/Icon";
import { Button } from "@/components/ui/Button";
import { depositModal } from "@/data/content";
import type { AccountUser } from "@/services/account/types";
import { Modal } from "./Modal";

type Channel = "btc" | "wire" | null;

/** Riquadro valore + pulsante di copia: quello che l'utente deve incollare da qualche parte. */
function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard non disponibile (contesto non sicuro, permesso negato): il
      // valore resta comunque leggibile e selezionabile a mano.
    }
  }

  return (
    <div>
      <p className="text-sm text-mist">{label}</p>
      <div className="mt-1.5 flex items-center gap-2 rounded-[var(--radius-control)] border border-line bg-panel-raised px-3.5 py-2.5">
        <span className="tabular min-w-0 flex-1 break-all text-[0.9375rem] text-paper">{value}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="grid size-8 shrink-0 place-items-center rounded-lg text-mist transition-colors hover:bg-panel hover:text-paper"
          aria-label={depositModal.copy}
        >
          <Icon name="copy" size={16} />
        </button>
      </div>
      {copied ? <p className="mt-1 text-xs text-mint">{depositModal.copied}</p> : null}
    </div>
  );
}

/**
 * Modale "Deposita": prima la scelta del metodo, poi i dati che
 * l'amministratore ha impostato per QUESTO utente — mai un indirizzo o un
 * IBAN inventati, come per il resto del wallet.
 *
 * Nessuna richiesta parte da qui: è solo consultazione. Il credito resta un
 * movimento separato che l'amministratore registra a mano quando vede
 * arrivare il versamento, esattamente come già accade oggi.
 */
export function DepositModal({
  account,
  open,
  onClose,
}: {
  account: AccountUser;
  open: boolean;
  onClose: () => void;
}) {
  const [channel, setChannel] = useState<Channel>(null);

  function handleClose() {
    onClose();
    // Il reset avviene dopo la chiusura, così l'utente non vede la modale
    // tornare alla scelta iniziale mentre si sta ancora chiudendo.
    setTimeout(() => setChannel(null), 200);
  }

  const title =
    channel === "btc" ? depositModal.btcTitle : channel === "wire" ? depositModal.wireTitle : depositModal.chooseTitle;

  return (
    <Modal open={open} onClose={handleClose} title={title}>
      {channel === null ? (
        <div className="space-y-4">
          <p className="text-sm text-mist">{depositModal.chooseSubtitle}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setChannel("btc")}
              className="panel group flex flex-col items-start gap-2 p-4 text-left"
            >
              <span className="icon-tile grid size-10 place-items-center rounded-[var(--radius-card)]">
                <Icon name="wallet" size={18} />
              </span>
              <span className="font-wide font-semibold text-paper">{depositModal.optionCrypto}</span>
              <span className="text-sm text-mist">{depositModal.optionCryptoDescription}</span>
            </button>
            <button
              type="button"
              onClick={() => setChannel("wire")}
              className="panel group flex flex-col items-start gap-2 p-4 text-left"
            >
              <span className="icon-tile grid size-10 place-items-center rounded-[var(--radius-card)]">
                <Icon name="bank" size={18} />
              </span>
              <span className="font-wide font-semibold text-paper">{depositModal.optionWire}</span>
              <span className="text-sm text-mist">{depositModal.optionWireDescription}</span>
            </button>
          </div>
        </div>
      ) : channel === "btc" ? (
        <div className="space-y-4">
          {account.depositBtcAddress ? (
            <CopyField label={depositModal.btcAddressLabel} value={account.depositBtcAddress} />
          ) : (
            <p className="text-sm text-mist">{depositModal.btcEmpty}</p>
          )}
          <p className="text-xs text-mist">{depositModal.note}</p>
          <Button variant="secondary" size="sm" onClick={() => setChannel(null)}>
            {depositModal.back}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {account.bankDetails ? (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                {account.bankDetails.name ? (
                  <CopyField label={depositModal.bankNameLabel} value={account.bankDetails.name} />
                ) : null}
                {account.bankDetails.iban ? (
                  <CopyField label={depositModal.bankIbanLabel} value={account.bankDetails.iban} />
                ) : null}
                {account.bankDetails.bic ? (
                  <CopyField label={depositModal.bankBicLabel} value={account.bankDetails.bic} />
                ) : null}
                {account.bankDetails.holder ? (
                  <CopyField label={depositModal.bankHolderLabel} value={account.bankDetails.holder} />
                ) : null}
              </div>
              <div>
                <CopyField
                  label={depositModal.bankReferenceLabel}
                  value={account.username || account.email}
                />
                <p className="mt-1.5 text-xs text-mist">{depositModal.bankReferenceHint}</p>
              </div>
            </>
          ) : (
            <p className="text-sm text-mist">{depositModal.bankEmpty}</p>
          )}
          <p className="text-xs text-mist">{depositModal.note}</p>
          <Button variant="secondary" size="sm" onClick={() => setChannel(null)}>
            {depositModal.back}
          </Button>
        </div>
      )}
    </Modal>
  );
}
