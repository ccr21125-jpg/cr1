"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon } from "@/components/icons/Icon";
import { Logo } from "@/components/layout/Logo";
import { dashboardHome, dashboardShell, type DashboardNavItem } from "@/data/content";
import { cn } from "@/lib/cn";
import { SidebarBalance } from "./SidebarBalance";

/**
 * Vince la corrispondenza più lunga: "/dashboard" è prefisso di ogni
 * sottopagina, quindi senza questo confronto resterebbe sempre acceso.
 */
function activeHref(pathname: string, items: DashboardNavItem[]): string | undefined {
  return items
    .map((item) => item.href)
    .filter((href) => pathname === href || pathname.startsWith(`${href}/`))
    .sort((a, b) => b.length - a.length)[0];
}

function NavLinks({
  pathname,
  items,
  onNavigate,
}: {
  pathname: string;
  items: DashboardNavItem[];
  onNavigate?: () => void;
}) {
  const current = activeHref(pathname, items);
  return (
    <ul className="space-y-1">
      {items.map((item) => {
        const active = item.href === current;
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group relative flex items-center gap-3 overflow-hidden rounded-[var(--radius-control)] border px-3 py-2.5 text-[0.9375rem] transition-[color,background-color,border-color,box-shadow] duration-300 ease-[var(--ease-ui)]",
                active
                  ? // La barretta a sinistra è un'ombra interna: segue il raggio dell'angolo
                    "border-mint/25 bg-mint/[0.08] font-medium text-mint shadow-[inset_3px_0_0_0_var(--color-mint),0_0_22px_-10px_rgb(103_227_174/0.8)]"
                  : "border-transparent text-mist hover:border-line hover:bg-panel-raised hover:text-paper",
              )}
            >
              <Icon
                name={item.icon}
                size={18}
                className="shrink-0 transition-transform duration-300 ease-[var(--ease-ui)] group-hover:scale-110"
              />
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function SignOut({ full = false }: { full?: boolean }) {
  return (
    <form action="/auth/signout" method="post">
      <button
        type="submit"
        className={cn(
          "flex items-center gap-3 rounded-[var(--radius-control)] px-3 py-2.5 text-[0.9375rem] text-mist transition-colors duration-200 hover:bg-panel-raised hover:text-paper",
          full && "w-full",
        )}
      >
        <Icon name="logout" size={18} className="shrink-0" />
        {dashboardShell.signOut}
      </button>
    </form>
  );
}

export function Sidebar({
  items,
  balanceSats,
  currency,
  siteName,
}: {
  items: DashboardNavItem[];
  siteName: string;
  balanceSats: number;
  currency: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Il drawer si chiude dai link stessi (onNavigate), da Esc e oltre il
  // breakpoint lg: non serve un effetto sul pathname.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const mq = window.matchMedia("(min-width: 1024px)");
    const onMq = (e: MediaQueryListEvent) => e.matches && setOpen(false);
    const prevOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    mq.addEventListener("change", onMq);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onMq);
    };
  }, [open]);

  return (
    <>
      {/* Barra mobile */}
      <div className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-line bg-ink/90 px-5 backdrop-blur-md lg:hidden">
        <Logo name={siteName} />
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? dashboardShell.menuClose : dashboardShell.menuOpen}
          className="-mr-2 grid size-11 place-items-center rounded-lg text-paper"
        >
          <Icon name={open ? "close" : "menu"} size={22} />
        </button>
      </div>

      {/* Drawer mobile */}
      <div
        hidden={!open}
        className="fixed inset-x-0 bottom-0 top-16 z-40 overflow-y-auto border-t border-line bg-ink px-5 py-6 lg:hidden"
      >
        <SidebarBalance balanceSats={balanceSats} currency={currency} />
        <nav aria-label={dashboardShell.navLabel} className="mt-6">
          <NavLinks pathname={pathname} items={items} onNavigate={() => setOpen(false)} />
        </nav>
        <div className="mt-6 border-t border-line pt-4">
          <SignOut full />
        </div>
      </div>

      {/* Sidebar desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[17rem] flex-col border-r border-line bg-panel px-4 py-6 lg:flex">
        <div className="px-3">
          <Logo name={siteName} />
        </div>
        <div className="mt-6">
          <SidebarBalance balanceSats={balanceSats} currency={currency} />
        </div>
        <nav aria-label={dashboardShell.navLabel} className="mt-6 flex-1">
          <NavLinks pathname={pathname} items={items} />
        </nav>
        <div className="border-t border-line pt-4">
          <SignOut full />
          <p className="mt-3 flex items-center gap-2 px-3 text-xs text-mist">
            <span aria-hidden="true" className="motion-safe:animate-halo size-1.5 rounded-full bg-mint" />
            {dashboardHome.statusOnline}
          </p>
        </div>
      </aside>
    </>
  );
}
