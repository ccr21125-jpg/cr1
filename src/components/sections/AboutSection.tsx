import { Icon } from "@/components/icons/Icon";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { Container } from "@/components/ui/Container";
import { DemoBadge } from "@/components/ui/DemoBadge";
import { Reveal } from "@/components/ui/Reveal";
import { getAboutContent } from "@/services/content/siteContentService";
import { getPlatformStats } from "@/services/content/statsService";

/**
 * "Chi siamo": testo e punti di forza a sinistra, numeri a destra.
 * Il testo e i numeri arrivano dal pannello admin (siteContentService e
 * statsService), con i valori di partenza di content.ts e stats.mock.ts.
 */
export async function AboutSection() {
  const [stats, about] = await Promise.all([getPlatformStats(), getAboutContent()]);
  const hasDemo = stats.some((s) => s.isDemo);

  return (
    <section id="chi-siamo" aria-labelledby="about-title" className="relative isolate overflow-hidden border-y border-line bg-[#070b0a] py-24 sm:py-32">
      {/* Alone verde in alto a sinistra, come nel resto del sito: solo decorazione */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_90%_at_0%_0%,rgb(57_185_130/0.22),transparent_70%)]"
      />

      <Container>
        <div className="grid items-center gap-14 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-mist">{about.eyebrow}</p>
            <h2
              id="about-title"
              className="font-display mt-3 text-[clamp(2rem,4.2vw,3.25rem)] leading-[1.05] text-paper text-balance"
            >
              {about.title}
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-mist text-pretty">{about.description}</p>

            {about.bullets.length > 0 ? (
              <ul className="mt-8 space-y-3.5">
                {about.bullets.map((text, i) => (
                  <li key={i} className="flex items-start gap-3 text-paper/90">
                    <Icon name="checkCircle" size={20} className="mt-0.5 shrink-0 text-mint" />
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </Reveal>

          <div>
            {hasDemo ? <DemoBadge label={about.demoBadgeLabel} className="mb-4" /> : null}
            <dl className="grid grid-cols-1 gap-5 min-[440px]:grid-cols-2">
              {stats.map((s, i) => (
                <Reveal
                  key={s.id}
                  delay={i * 80}
                  className="flex min-h-44 flex-col rounded-[1.75rem] border border-line bg-panel/70 p-7 backdrop-blur-sm"
                >
                  <dt className="order-2 mt-auto pt-6 text-sm font-medium text-paper">{s.label}</dt>
                  <dd className="order-1 font-display whitespace-nowrap text-[clamp(2rem,3.4vw,2.6rem)] leading-none text-mint">
                    <AnimatedCounter value={s.value} decimals={s.decimals} prefix={s.prefix} suffix={s.suffix} />
                  </dd>
                  {s.isDemo || s.source ? (
                    <dd className="order-3 mt-1 text-xs text-mist">{s.isDemo ? "Dato dimostrativo" : `Fonte: ${s.source}`}</dd>
                  ) : null}
                </Reveal>
              ))}
            </dl>
          </div>
        </div>
      </Container>
    </section>
  );
}
