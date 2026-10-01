"use client";

import { useState } from "react";
import { Icon } from "@/components/icons/Icon";
import { walletPage } from "@/data/content";
import { cn } from "@/lib/cn";
import { formatAmount, formatBtc } from "@/lib/format";
import { satsToBtc, satsToCurrency } from "@/lib/money";
import { Shimmer } from "./Shimmer";
import { useRates } from "./RatesProvider";

/** Controvalore e cambio: dipendono dal cambio corrente, che arriva dal browser. */
function Valuation({ sats, currency }: { sats: number; currency: string }) {
  const rates = useRates();

  if (rates.status === "loading") return <Shimmer label="Calcolo del controvalore" className="mt-2 h-6 w-56" />;
  if (rates.status === "failed") return <p className="mt-2 text-mist">—</p>;

  return (
    <div className="mt-2 flex flex-wrap items-center gap-3">
      <span className="tabular font-wide text-lg font-semibold text-mint">
        ≈ {formatAmount(satsToCurrency(sats, rates.rates.eur), currency)}
      </span>
      <span
        title={walletPage.rateTitle}
        className="tabular rounded-lg border border-line bg-panel-raised px-2.5 py-1 text-xs text-mist"
      >
        @ {formatAmount(rates.rates.eur, currency)}
      </span>
    </div>
  );
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Appunti non disponibili: l'indirizzo resta comunque leggibile e selezionabile.
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? walletPage.copied : walletPage.copy}
      title={copied ? walletPage.copied : walletPage.copy}
      className="grid size-9 shrink-0 place-items-center rounded-lg border border-mint/25 bg-mint/10 text-mint transition-colors hover:bg-mint/20"
    >
      <Icon name={copied ? "checkCircle" : "copy"} size={16} />
    </button>
  );
}

/**
 * La scheda "Portafoglio Bitcoin" della pagina Portafogli: saldo in bitcoin,
 * controvalore e indirizzo. L'indirizzo lo imposta l'amministratore per ogni
 * cliente; finché non lo fa la scheda lo dice, senza inventarne uno.
 */
export function WalletOverview({
  balanceSats,
  currency,
  address,
}: {
  balanceSats: number;
  currency: string;
  address: string | null;
}) {
  const amount = formatBtc(satsToBtc(balanceSats)).replace(/ BTC$/, "");

  return (
    <section className="panel relative overflow-hidden p-6 sm:p-9">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-[radial-gradient(closest-side,rgb(57_185_130/0.22),transparent)]"
      />

      <div className="relative flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <span
            aria-hidden="true"
            className="grid size-14 shrink-0 place-items-center rounded-2xl bg-[linear-gradient(135deg,#67e3ae,#e6a756)] shadow-[0_8px_24px_-8px_rgb(103_227_174/0.6)]"
          >
            <span className="grid size-7 place-items-center rounded-full bg-ink/85 text-sm font-bold text-[#e6a756]">₿</span>
          </span>
          <div>
            <h2 className="font-wide text-xl font-semibold text-paper">{walletPage.cardTitle}</h2>
            <p className="mt-0.5 text-sm text-mist">{walletPage.cardDescription}</p>
          </div>
        </div>

        <span
          className={cn(
            "inline-flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium",
            address
              ? "border-mint/30 bg-mint/10 text-mint"
              : "border-[#e8c24a]/25 bg-[#e8c24a]/[0.07] text-[#e9d38c]",
          )}
        >
          <span aria-hidden="true" className={cn("size-1.5 rounded-full", address ? "bg-mint" : "bg-[#e8c24a]")} />
          {address ? walletPage.statusActive : walletPage.statusPending}
        </span>
      </div>

      <div className="relative mt-9">
        <p className="font-display tabular text-[clamp(2.25rem,6vw,3.5rem)] leading-none text-paper">
          {amount} <span className="font-wide text-[0.4em] font-semibold text-mint">BTC</span>
        </p>
        <Valuation sats={balanceSats} currency={currency} />
      </div>

      <div className="relative mt-9">
        <p className="text-xs uppercase tracking-wide text-mist">{walletPage.addressLabel}</p>
        <div
          className={cn(
            "mt-2.5 flex items-center gap-3 rounded-[var(--radius-card)] border px-4 py-3",
            address ? "border-line bg-ink/40" : "border-dashed border-line",
          )}
        >
          <span
            className={cn(
              "min-w-0 flex-1 break-all text-sm",
              address ? "font-mono text-paper/90" : "text-mist",
            )}
          >
            {address ?? walletPage.addressEmpty}
          </span>
          {address ? <CopyButton value={address} /> : null}
        </div>
      </div>
    </section>
  );
}
