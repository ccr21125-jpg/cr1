import type { CSSProperties } from "react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { chains } from "@/data/chains";
import { getMultichainContent } from "@/services/content/siteContentService";

const RX = 36; // raggio orizzontale (% della larghezza)
const RY = 34; // raggio verticale (% dell'altezza)

/** Posizioni calcolate sull'ellisse: aggiungendo una chain il diagramma si ridistribuisce da solo. */
const nodes = chains.map((chain, i) => {
  const angle = -Math.PI / 2 + (i / chains.length) * Math.PI * 2;
  return {
    ...chain,
    x: +(50 + RX * Math.cos(angle)).toFixed(2),
    y: +(50 + RY * Math.sin(angle)).toFixed(2),
  };
});

export async function MultichainSection() {
  const c = await getMultichainContent();

  return (
    <section id="multichain" aria-labelledby="multichain-title" className="py-24 sm:py-32">
      <Container>
        <SectionHeader id="multichain-title" title={c.title} description={c.description} />

        <Reveal className="mt-14">
          <div className="panel relative overflow-hidden p-5 sm:p-8 md:aspect-[16/10] md:p-0 lg:aspect-[16/8]">
            <div aria-hidden="true" className="bg-grid absolute inset-0 hidden opacity-70 md:block [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />

            {/* Connessioni hub → chain (solo desktop) */}
            <svg aria-hidden="true" viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 hidden h-full w-full md:block">
              {nodes.map((n) => (
                <line
                  key={n.id}
                  x1="50"
                  y1="50"
                  x2={n.x}
                  y2={n.y}
                  stroke="var(--color-mint)"
                  strokeOpacity="0.28"
                  strokeWidth="1"
                  strokeDasharray="3 5"
                  vectorEffect="non-scaling-stroke"
                />
              ))}
              <ellipse cx="50" cy="50" rx={RX} ry={RY} fill="none" stroke="var(--color-line-strong)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            </svg>

            {/* Hub centrale */}
            <div className="relative mb-5 flex items-center gap-4 rounded-[var(--radius-card)] border border-mint/35 bg-ink/80 p-4 md:absolute md:left-1/2 md:top-1/2 md:mb-0 md:-translate-x-1/2 md:-translate-y-1/2 md:flex-col md:gap-2 md:px-8 md:py-6 md:text-center">
              <span className="grid size-11 place-items-center rounded-xl bg-mint/10 ring-1 ring-mint/40">
                <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
                  <circle cx="11" cy="11" r="3" fill="var(--color-mint)" />
                  <circle cx="11" cy="11" r="8" fill="none" stroke="var(--color-mint)" strokeOpacity="0.5" strokeDasharray="2 3" />
                </svg>
              </span>
              <div>
                <p className="font-wide font-semibold text-paper">{c.hubLabel}</p>
                <p className="text-sm text-mist">{c.hubDetail}</p>
              </div>
            </div>

            <ul className="grid grid-cols-1 gap-3 min-[400px]:grid-cols-2 md:absolute md:inset-0 md:block" aria-label="Blockchain supportate">
              {nodes.map((n) => (
                <li
                  key={n.id}
                  style={{ "--x": `${n.x}%`, "--y": `${n.y}%` } as CSSProperties}
                  className="flex items-center gap-3 rounded-[var(--radius-card)] border border-line bg-panel-raised p-3 transition-colors duration-200 hover:border-line-strong md:absolute md:left-[var(--x)] md:top-[var(--y)] md:w-44 md:-translate-x-1/2 lg:w-52 md:-translate-y-1/2 md:bg-panel"
                >
                  <span
                    aria-hidden="true"
                    className="font-wide grid size-9 shrink-0 place-items-center rounded-lg text-xs font-semibold"
                    style={{ color: n.tint, background: `color-mix(in srgb, ${n.tint} 12%, transparent)` }}
                  >
                    {n.mark}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-paper">{n.name}</p>
                    <p className="text-xs text-mist">
                      {n.kind}, {n.vm}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        <p className="mt-5 text-sm text-mist">{c.moreLabel}</p>
      </Container>
    </section>
  );
}
