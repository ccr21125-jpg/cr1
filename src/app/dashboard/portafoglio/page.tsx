import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { Icon, type IconName } from "@/components/icons/Icon";
import { WalletOverview } from "@/components/dashboard/WalletOverview";
import { walletPage } from "@/data/content";
import { formatBtc } from "@/lib/format";
import { satsToBtc } from "@/lib/money";
import { getAccount } from "@/services/account/accountService";

export const metadata: Metadata = { title: "Portafogli" };

function SummaryChip({ icon, children }: { icon: IconName; children: ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-line bg-panel px-4 py-3">
      <span className="grid size-9 place-items-center rounded-xl bg-mint/10 text-mint">
        <Icon name={icon} size={18} />
      </span>
      <span className="tabular font-wide text-base font-semibold text-paper">{children}</span>
    </div>
  );
}

function InfoTile({
  icon,
  tone,
  label,
  value,
  uppercase,
}: {
  icon: IconName;
  tone: string;
  label: string;
  value: string;
  uppercase?: boolean;
}) {
  return (
    <div className="flex items-center gap-4 rounded-[1.25rem] border border-line bg-panel/70 p-5">
      <span className={`grid size-11 shrink-0 place-items-center rounded-xl ${tone}`}>
        <Icon name={icon} size={20} />
      </span>
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wide text-mist">{label}</p>
        <p className={`mt-0.5 break-all font-wide text-base font-semibold text-paper ${uppercase ? "uppercase" : ""}`}>
          {value}
        </p>
      </div>
    </div>
  );
}

/**
 * "Portafogli": la scheda del portafoglio Bitcoin del cliente e i dati del suo
 * account. L'indirizzo del portafoglio lo imposta l'amministratore, cliente
 * per cliente (colonna `wallet_address`, separata dai dati di deposito).
 */
export default async function PortfolioPage() {
  const account = await getAccount();
  if (!account) notFound();

  const fullName = [account.firstName, account.lastName].filter(Boolean).join(" ") || account.username;

  return (
    <div className="dash-stack space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-[clamp(1.75rem,4vw,2.5rem)] leading-tight text-paper">{walletPage.title}</h1>
          <p className="mt-1.5 text-mist">{walletPage.description}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <SummaryChip icon="wallet">{formatBtc(satsToBtc(account.balanceSats))}</SummaryChip>
          <SummaryChip icon="shield">{account.walletAddress ? 1 : 0}</SummaryChip>
        </div>
      </header>

      <WalletOverview balanceSats={account.balanceSats} currency={account.currency} address={account.walletAddress} />

      <section aria-labelledby="account-info-title">
        <div className="flex items-center gap-3.5">
          <span className="grid size-11 place-items-center rounded-xl bg-[#1d1a33] text-[#a98cf0]">
            <Icon name="user" size={20} />
          </span>
          <div>
            <h2 id="account-info-title" className="font-wide text-lg font-semibold text-paper">
              {walletPage.accountTitle}
            </h2>
            <p className="text-sm text-mist">{walletPage.accountDescription}</p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <InfoTile
            icon="user"
            tone="bg-[#1d1a33] text-[#a98cf0]"
            label={walletPage.fullNameLabel}
            value={fullName}
            uppercase
          />
          <InfoTile icon="mail" tone="bg-mint/10 text-mint" label={walletPage.emailLabel} value={account.email} />
          <InfoTile
            icon="wallet"
            tone="bg-mint/10 text-mint"
            label={walletPage.accountBalanceLabel}
            value={account.currency}
          />
        </div>
      </section>
    </div>
  );
}
