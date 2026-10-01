import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdjustBalanceForm } from "@/components/dashboard/AdjustBalanceForm";
import { Card, EmptyState } from "@/components/dashboard/Card";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DepositDetailsForm } from "@/components/dashboard/DepositDetailsForm";
import { WalletAddressForm } from "@/components/dashboard/WalletAddressForm";
import { RoleToggle } from "@/components/dashboard/RoleToggle";
import { Money, Btc } from "@/components/dashboard/Money";
import { WithdrawalRecord, WithdrawalReview } from "@/components/dashboard/WithdrawalReview";
import { adminPage } from "@/data/content";
import { formatAmount } from "@/lib/format";
import { getAccount } from "@/services/account/accountService";
import { listRecentLedger, listUsers, listWithdrawals } from "@/services/admin/adminService";

export const metadata: Metadata = { title: adminPage.title };
export const dynamic = "force-dynamic";

/**
 * Pannello di amministrazione.
 *
 * Questo controllo nasconde la pagina; a impedire davvero le operazioni sono
 * le policy RLS e i controlli dentro le funzioni SQL, che un client non può
 * aggirare nemmeno chiamando direttamente le API di Supabase.
 */
export default async function AdminPage() {
  const account = await getAccount();
  if (!account) notFound();
  if (!account.isAdmin) notFound();

  const [users, ledger, withdrawals] = await Promise.all([
    listUsers(),
    listRecentLedger(),
    listWithdrawals(),
  ]);
  const totalSats = users.reduce((sum, u) => sum + u.balanceSats, 0);
  const emailById = new Map(users.map((u) => [u.id, u.email]));

  // null = tabella assente, diverso da [] ("nessuna richiesta"): il pannello
  // deve dire che manca la migrazione, non che la coda è vuota.
  const withdrawalsReady = withdrawals !== null;
  const queue = (withdrawals ?? []).filter((w) => w.status === "pending");
  const settled = (withdrawals ?? []).filter((w) => w.status !== "pending");

  return (
    <div className="dash-stack space-y-8">
      <DashboardHeader title={adminPage.title} />
      <p className="max-w-2xl text-mist">{adminPage.description}</p>

      <div className="grid gap-5 sm:grid-cols-3">
        <Card>
          <p className="text-sm text-mist">{adminPage.totalUsers}</p>
          <p className="font-display tabular mt-2 text-3xl text-paper">{users.length}</p>
        </Card>
        <Card>
          <p className="text-sm text-mist">{adminPage.totalBalance}</p>
          <Money sats={totalSats} className="font-display tabular mt-2 block text-3xl text-paper" />
          <Btc sats={totalSats} className="mt-1 block text-xs text-mist" />
        </Card>
        <Card>
          <p className="text-sm text-mist">{adminPage.pendingWithdrawals}</p>
          <p
            className={`font-display tabular mt-2 text-3xl ${queue.length > 0 ? "glow-mint" : "text-paper"}`}
          >
            {queue.length}
          </p>
        </Card>
      </div>

      {/* La coda sta in alto: è l'unica parte del pannello che aspetta qualcuno. */}
      <Card title={adminPage.withdrawalsPendingTitle}>
        {!withdrawalsReady ? (
          <EmptyState message={adminPage.withdrawalsMigrationMissing} icon="alert" />
        ) : queue.length === 0 ? (
          <EmptyState message={adminPage.withdrawalsPendingEmpty} icon="upload" />
        ) : (
          <ul className="space-y-4">
            {queue.map((withdrawal) => (
              <WithdrawalReview key={withdrawal.id} withdrawal={withdrawal} />
            ))}
          </ul>
        )}
      </Card>

      <Card title={adminPage.withdrawalsHistoryTitle}>
        {settled.length === 0 ? (
          <EmptyState message={adminPage.withdrawalsEmpty} icon="document" />
        ) : (
          <ul className="space-y-3">
            {settled.map((withdrawal) => (
              <WithdrawalRecord key={withdrawal.id} withdrawal={withdrawal} />
            ))}
          </ul>
        )}
      </Card>

      <Card title={adminPage.usersTitle}>
        {users.length === 0 ? (
          <EmptyState message={adminPage.usersEmpty} icon="user" />
        ) : (
          <ul className="space-y-4">
            {users.map((user) => (
              <li key={user.id} className="rounded-[var(--radius-card)] border border-line bg-panel-raised p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-medium text-paper">{user.fullName ?? user.email}</p>
                    <p className="mt-0.5 break-all text-sm text-mist">{user.email}</p>
                    {user.phone || user.city ? (
                      <p className="mt-0.5 text-sm text-mist">
                        {[user.phone, user.city].filter(Boolean).join(" · ")}
                      </p>
                    ) : null}
                  </div>
                  <div className="text-right">
                    <Btc sats={user.balanceSats} className="tabular font-wide block text-xl text-paper" />
                    <Money
                      sats={user.balanceSats}
                      currency={user.currency}
                      className="tabular block text-sm text-mist"
                    />
                    <p className="mt-1 text-xs text-mist">
                      {user.isAdmin ? adminPage.roleAdmin : adminPage.roleUser}
                    </p>
                  </div>
                </div>

                <div className="mt-5 border-t border-line pt-5">
                  <AdjustBalanceForm userId={user.id} />
                </div>

                <div className="mt-4 border-t border-line pt-4">
                  <WalletAddressForm userId={user.id} walletAddress={user.walletAddress} />
                </div>

                <div className="mt-4 border-t border-line pt-4">
                  <DepositDetailsForm
                    userId={user.id}
                    btcAddress={user.depositBtcAddress}
                    bankDetails={user.bankDetails}
                  />
                </div>

                {/* Non ci si può revocare da soli: lo impedisce anche il database. */}
                {user.id === account.id ? null : (
                  <div className="mt-4 border-t border-line pt-4">
                    <RoleToggle userId={user.id} isAdmin={user.isAdmin} />
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title={adminPage.ledgerTitle}>
        {ledger.length === 0 ? (
          <EmptyState message={adminPage.ledgerEmpty} icon="document" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[40rem] text-left text-sm">
              <thead>
                <tr className="border-b border-line text-mist">
                  <th scope="col" className="pb-3 font-medium">{adminPage.columns.date}</th>
                  <th scope="col" className="pb-3 font-medium">{adminPage.columns.user}</th>
                  <th scope="col" className="pb-3 font-medium">{adminPage.columns.amount}</th>
                  <th scope="col" className="pb-3 font-medium">{adminPage.columns.balanceAfter}</th>
                  <th scope="col" className="pb-3 font-medium">{adminPage.columns.reason}</th>
                </tr>
              </thead>
              <tbody>
                {ledger.map((entry) => (
                  <tr key={entry.id} className="border-b border-line last:border-0">
                    <td className="tabular py-3 text-mist">
                      {new Date(entry.createdAt).toLocaleString("it-IT")}
                    </td>
                    <td className="break-all py-3 text-mist">{emailById.get(entry.userId) ?? entry.userId}</td>
                    <td className={`tabular py-3 ${entry.amountSats >= 0 ? "text-mint" : "text-loss"}`}>
                      <Btc sats={entry.amountSats} className="block" />
                      {/* Il cambio di ALLORA, non quello di adesso: è il
                          valore che aveva il movimento quando è avvenuto. */}
                      <span className="block text-xs text-mist">
                        {entry.rateEurCents === null
                          ? "—"
                          : formatAmount((entry.amountSats / 100_000_000) * (entry.rateEurCents / 100), "EUR")}
                      </span>
                    </td>
                    <td className="tabular py-3 text-paper">
                      <Btc sats={entry.balanceAfterSats} />
                    </td>
                    <td className="py-3 text-mist">{entry.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
