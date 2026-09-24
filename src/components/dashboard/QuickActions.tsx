"use client";

import { useState } from "react";
import { Icon, type IconName } from "@/components/icons/Icon";
import { dashboardHome } from "@/data/content";
import type { AccountUser } from "@/services/account/types";
import { DepositModal } from "./DepositModal";
import { Modal } from "./Modal";

interface Action {
  id: string;
  icon: IconName;
  title: string;
  description: string;
  badges?: string[];
  /** Assenti per "deposita": quell'azione apre DepositModal, non questa. */
  modalTitle?: string;
  modalBody?: string;
}

const actions: Action[] = [
  {
    id: "deposita",
    icon: "wallet",
    title: dashboardHome.deposit,
    description: dashboardHome.depositDescription,
  },
  {
    id: "scambia",
    icon: "settle",
    title: dashboardHome.exchange,
    description: dashboardHome.exchangeDescription,
    badges: dashboardHome.exchangeBadges,
    modalTitle: dashboardHome.exchangeModalTitle,
    modalBody: dashboardHome.exchangeModalBody,
  },
  {
    id: "chiave",
    icon: "lock",
    title: dashboardHome.exportKey,
    description: dashboardHome.exportKeyDescription,
    modalTitle: dashboardHome.exportKeyModalTitle,
    modalBody: dashboardHome.exportKeyModalBody,
  },
];

/**
 * "Scambia" ed "Esporta chiave" non sono ancora collegate: aprono una modale
 * che lo dichiara, invece di far credere che l'operazione sia avvenuta.
 * "Deposita" invece è collegata per davvero: apre DepositModal, che mostra i
 * dati che l'amministratore ha impostato per questo utente.
 */
export function QuickActions({ account }: { account: AccountUser }) {
  const [open, setOpen] = useState<Action | null>(null);
  const depositing = open?.id === "deposita";

  return (
    <>
      <div className="grid gap-4 md:grid-cols-3">
        {actions.map((action) => (
          <button
            key={action.id}
            type="button"
            onClick={() => setOpen(action)}
            className="panel group flex items-center gap-4 p-5 text-left"
          >
            <span className="icon-tile grid size-11 shrink-0 place-items-center rounded-[var(--radius-card)] transition-transform duration-300 ease-[var(--ease-ui)] group-hover:scale-105">
              <Icon name={action.icon} size={19} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-center gap-2">
                <span className="font-wide font-semibold text-paper">{action.title}</span>
                {action.badges?.map((badge) => (
                  <span
                    key={badge}
                    className="rounded-full border border-line bg-panel-raised px-2 py-0.5 text-[0.6875rem] text-mist"
                  >
                    {badge}
                  </span>
                ))}
              </span>
              <span className="mt-0.5 block text-sm text-mist">{action.description}</span>
            </span>
            <Icon
              name="chevron"
              size={16}
              className="shrink-0 text-mist transition-[transform,color] duration-300 ease-[var(--ease-ui)] group-hover:translate-x-1 group-hover:text-mint"
            />
          </button>
        ))}
      </div>

      <DepositModal account={account} open={depositing} onClose={() => setOpen(null)} />

      <Modal
        open={open !== null && !depositing}
        onClose={() => setOpen(null)}
        title={open?.modalTitle ?? ""}
      >
        <p>{open?.modalBody}</p>
      </Modal>
    </>
  );
}
