import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";
import { getSuccessContent } from "@/services/content/siteContentService";

type SuccessContent = Awaited<ReturnType<typeof getSuccessContent>>;

/**
 * Metrica: se c'è un dato verificato con fonte lo mostra con la citazione;
 * altrimenti anima `metricValue`, una cifra dimostrativa impostata
 * dall'amministratore (/dashboard/admin/contenuti), non una metrica
 * certificata — va trattata di conseguenza finché non lo diventa davvero.
 */
function MetricSlot({ c }: { c: SuccessContent }) {
  if (c.verifiedMetric) {
    return (
      <div className="rounded-[var(--radius-card)] border border-line bg-panel p-6">
        <p className="font-display tabular text-5xl text-mint">{c.verifiedMetric.value}</p>
        <p className="mt-2 text-sm text-paper">{c.verifiedMetric.label}</p>
        <p className="mt-1 text-xs text-mist">Fonte: {c.verifiedMetric.source}</p>
      </div>
    );
  }

  const parsed = Number(c.metricValue.replace(",", "."));
  const metric = Number.isFinite(parsed) ? parsed : 0;

  return (
    <div className="rounded-[var(--radius-card)] border border-line bg-panel p-6">
      <p className="font-display tabular text-5xl text-mint">
        <AnimatedCounter value={metric} suffix="%" />
      </p>
      <p className="mt-2 text-sm text-paper">{c.metricLabel}</p>
    </div>
  );
}

/** Pipeline concettuale: la linea verticale collega i passaggi, un punto la percorre lentamente. */
function FlowPanel({ c }: { c: SuccessContent }) {
  const last = c.flow.length - 1;
  return (
    <div className="panel relative p-6 sm:p-10">
      <p className="text-sm text-mist">Come nasce un supporto alle decisioni</p>
      <ol className="relative mt-8">
        <span aria-hidden="true" className="absolute bottom-7 left-[1.1875rem] top-7 w-px bg-line-strong">
          <span className="absolute left-1/2 size-1.5 -translate-x-1/2 rounded-full bg-mint shadow-[0_0_12px_2px_rgb(103_227_174/0.5)] animate-travel" />
        </span>
        {c.flow.map((step, i) => (
          <li key={i} className="relative flex gap-5 pb-8 last:pb-0">
            <span
              className={cn(
                "tabular relative z-10 grid size-10 shrink-0 place-items-center rounded-full border text-sm font-medium",
                i === last ? "border-mint bg-mint text-ink" : "border-line-strong bg-panel text-mint",
              )}
            >
              {i + 1}
            </span>
            <div
              className={cn(
                "flex-1 rounded-[var(--radius-card)] border px-5 py-4",
                i === last ? "border-mint/40 bg-mint/[0.06]" : "border-line bg-ink/40",
              )}
            >
              <h3 className="font-wide font-semibold text-paper">{step.title}</h3>
              <p className="mt-0.5 text-sm text-mist">{step.detail}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

export async function SuccessSection() {
  const c = await getSuccessContent();

  return (
    <section id="analisi" aria-labelledby="success-title" className="border-y border-line bg-[#070b0a] py-24 sm:py-32">
      <Container className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
        <Reveal>
          <h2 id="success-title" className="font-display text-[clamp(2rem,4.2vw,3.25rem)] leading-[1.02] text-balance">
            {c.title}
          </h2>
          <p className="font-wide mt-6 text-xl font-medium leading-snug text-paper/90 text-pretty">{c.subtitle}</p>
          <div className="mt-6 space-y-4 text-mist">
            {c.body.map((p, i) => (
              <p key={i} className="max-w-[58ch]">
                {p}
              </p>
            ))}
          </div>
          <div className="mt-10">
            <MetricSlot c={c} />
          </div>
          <p className="mt-4 text-xs text-mist/80">{c.disclaimer}</p>
        </Reveal>

        <Reveal delay={120}>
          <FlowPanel c={c} />
        </Reveal>
      </Container>
    </section>
  );
}
