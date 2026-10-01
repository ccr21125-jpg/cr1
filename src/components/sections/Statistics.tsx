import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { Container } from "@/components/ui/Container";
import { DemoBadge } from "@/components/ui/DemoBadge";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getStatsContent } from "@/services/content/siteContentService";
import { getPlatformStats } from "@/services/content/statsService";

export async function Statistics() {
  const [stats, statsContent] = await Promise.all([getPlatformStats(), getStatsContent()]);
  const hasDemo = stats.some((s) => s.isDemo);

  return (
    <section aria-labelledby="stats-title" className="border-y border-line bg-[#070b0a] py-24 sm:py-32">
      <Container>
        <SectionHeader
          id="stats-title"
          title={statsContent.title}
          description={statsContent.description}
          aside={hasDemo ? <DemoBadge label={statsContent.demoBadgeLabel} /> : null}
        />

        <dl className="mt-14 grid grid-cols-1 gap-px overflow-hidden rounded-[var(--radius-panel)] border border-line bg-line min-[440px]:grid-cols-2 xl:grid-cols-5">
          {stats.map((s, i) => (
            <div
              key={s.id}
              className={`flex flex-col bg-ink p-6 sm:p-8 xl:px-6 ${i === stats.length - 1 ? "min-[440px]:col-span-2 xl:col-span-1" : ""}`}
            >
              <dt className="order-2 mt-3 text-sm text-paper">{s.label}</dt>
              <dd className="order-1 font-display whitespace-nowrap text-[clamp(2.25rem,4vw,2.75rem)] leading-none text-mint xl:text-[2.5rem]">
                <AnimatedCounter value={s.value} decimals={s.decimals} prefix={s.prefix} suffix={s.suffix} />
              </dd>
              {s.isDemo || s.source ? (
                <dd className="order-3 mt-1 text-xs text-mist">{s.isDemo ? "Dato dimostrativo" : `Fonte: ${s.source}`}</dd>
              ) : null}
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
