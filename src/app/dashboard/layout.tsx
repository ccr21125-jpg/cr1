import type { Metadata } from "next";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { RatesProvider } from "@/components/dashboard/RatesProvider";
import { PanelGlow } from "@/components/dashboard/PanelGlow";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { adminPage, dashboardNav, siteContentPage } from "@/data/content";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getAccount } from "@/services/account/accountService";

export const metadata: Metadata = { robots: { index: false, follow: false } };

/** Ogni pagina dell'area riservata dipende dalla sessione. */
export const dynamic = "force-dynamic";

/**
 * Cornice dell'area riservata: sidebar fissa da lg in su, drawer sotto.
 * Il proxy blocca già /dashboard agli anonimi; il controllo qui è la seconda
 * serratura, quella che conta davvero perché verifica la sessione col server.
 */
export default async function DashboardLayout({ children }: { children: ReactNode }) {
  if (!isSupabaseConfigured()) redirect("/accedi");
  const account = await getAccount();
  if (!account) redirect("/accedi?next=/dashboard");

  // La voce compare solo agli amministratori; il permesso vero però sta nel
  // database, quindi nasconderla non è la misura di sicurezza, solo l'ordine.
  const items = account.isAdmin
    ? [
        ...dashboardNav,
        { label: adminPage.navLabel, href: "/dashboard/admin", icon: "lock" as const },
        { label: siteContentPage.navLabel, href: "/dashboard/admin/contenuti", icon: "document" as const },
      ]
    : dashboardNav;

  return (
    // Un solo provider per tutta l'area: i cambi si chiedono una volta sola,
    // non una per componente che li mostra.
    <RatesProvider>
      <PanelGlow />
      <div className="dash relative isolate min-h-dvh lg:pl-[17rem]">
        {/* isolate + -z-10: l'alone resta dietro al contenuto di questo riquadro */}
        <div aria-hidden="true" className="dash-aura -z-10" />
        <Sidebar items={items} balanceSats={account.balanceSats} currency={account.currency} />
        <main id="contenuto" tabIndex={-1} className="outline-none">
          <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 sm:py-10">{children}</div>
        </main>
      </div>
    </RatesProvider>
  );
}
