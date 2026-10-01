"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useState } from "react";
import { AuthNavLinks } from "@/components/auth/AuthNavLinks";
import { Icon } from "@/components/icons/Icon";
import { Container } from "@/components/ui/Container";
import { mainNav } from "@/data/content";
import { useScrolled } from "@/hooks/useScrolled";
import { cn } from "@/lib/cn";
import { Logo } from "./Logo";

export function Navbar({ siteName }: { siteName: string }) {
  const scrolled = useScrolled();
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const close = useCallback(() => setOpen(false), []);

  // Menu mobile: Esc per chiudere, blocco dello scroll, chiusura oltre il breakpoint lg
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

  const solid = scrolled || open;

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-[background-color,border-color] duration-300",
        solid ? "border-line bg-ink/90 backdrop-blur-md" : "border-transparent bg-ink/40 backdrop-blur-sm",
      )}
    >
      <Container className="flex h-[4.25rem] items-center justify-between gap-6">
        <Logo name={siteName} onClick={close} />

        <nav aria-label="Navigazione principale" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {mainNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="rounded-md px-3 py-2 text-[0.9375rem] text-mist transition-colors hover:text-paper"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <AuthNavLinks size="sm" className="hidden lg:flex" />

        <button
          type="button"
          className="-mr-2 grid size-11 place-items-center rounded-lg text-paper lg:hidden"
          aria-expanded={open}
          aria-controls={menuId}
          aria-label={open ? "Chiudi il menu" : "Apri il menu"}
          onClick={() => setOpen((v) => !v)}
        >
          <Icon name={open ? "close" : "menu"} size={22} />
        </button>
      </Container>

      <div
        id={menuId}
        hidden={!open}
        className="absolute inset-x-0 top-full h-[calc(100dvh-4.25rem)] overflow-y-auto border-t border-line bg-ink lg:hidden"
      >
        <Container className="flex h-full flex-col py-6">
          <nav aria-label="Navigazione mobile">
            <ul className="divide-y divide-line">
              {mainNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={close}
                    className="font-wide flex py-4 text-2xl font-medium tracking-tight text-paper"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <AuthNavLinks size="lg" onNavigate={close} className="mt-auto pt-8" />
        </Container>
      </div>
    </header>
  );
}
