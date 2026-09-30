"use client";

import { useState } from "react";
import { Icon } from "@/components/icons/Icon";
import { Reveal } from "@/components/ui/Reveal";
import type { FaqItem } from "@/data/content";
import { cn } from "@/lib/cn";

/**
 * Fisarmonica di domande e risposte: una sola aperta alla volta, la prima già
 * aperta per non mostrare una sezione che sembra vuota al primo sguardo.
 *
 * Ogni domanda è un <button> con aria-expanded/aria-controls: funziona da
 * tastiera e per chi usa uno screen reader, non solo al clic del mouse.
 * L'altezza della risposta è animata in CSS puro (.faq-rows in globals.css),
 * non misurata via JS.
 */
export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="panel divide-y divide-line overflow-hidden">
      {items.map((item, i) => {
        const open = openIndex === i;
        const buttonId = `faq-button-${i}`;
        const panelId = `faq-panel-${i}`;

        return (
          <Reveal key={i} delay={i * 60}>
            <div className="relative">
              {open ? <span aria-hidden="true" className="absolute inset-y-0 left-0 w-[3px] bg-mint" /> : null}
              <h3>
                <button
                  type="button"
                  id={buttonId}
                  aria-expanded={open}
                  aria-controls={panelId}
                  onClick={() => setOpenIndex(open ? null : i)}
                  className={cn(
                    "flex w-full items-center justify-between gap-4 px-5 py-5 text-left transition-colors duration-300 ease-[var(--ease-ui)] sm:px-7",
                    open ? "bg-panel-raised" : "hover:bg-panel-raised/60",
                  )}
                >
                  <span className="font-wide font-semibold text-paper">{item.q}</span>
                  <Icon
                    name="chevron"
                    size={18}
                    className={cn(
                      "shrink-0 text-mist transition-[transform,color] duration-300 ease-[var(--ease-ui)]",
                      open ? "rotate-90 text-mint" : "rotate-0",
                    )}
                  />
                </button>
              </h3>

              <div
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
                data-open={open}
                className={cn(
                  "faq-rows px-5 sm:px-7",
                  // Il padding verticale sta qui, non sul <p>, e solo da aperto: un
                  // <p> compresso a riga 0 non può liberarsi del proprio padding, e
                  // quel tanto di spazio residuo bastava a lasciar leggere la prima
                  // riga della risposta anche a domanda chiusa.
                  open ? "bg-panel-raised pb-5 sm:pb-7" : undefined,
                )}
              >
                <p className="pr-8 text-mist">{item.a}</p>
              </div>
            </div>
          </Reveal>
        );
      })}
    </div>
  );
}
