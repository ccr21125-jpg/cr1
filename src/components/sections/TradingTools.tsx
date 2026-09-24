import { Icon } from "@/components/icons/Icon";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { cn } from "@/lib/cn";
import { getFeatures, getToolsContent } from "@/services/content/siteContentService";

/**
 * Griglia asimmetrica: le prime due funzionalità occupano più spazio,
 * le successive si dispongono su tre colonne (layout a 6 colonne su desktop).
 */
export async function TradingTools() {
  const [toolsContent, features] = await Promise.all([getToolsContent(), getFeatures()]);

  return (
    <section id="trading" aria-labelledby="trading-title" className="py-24 sm:py-32">
      <Container>
        <SectionHeader id="trading-title" title={toolsContent.title} description={toolsContent.description} />

        <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          {features.map((f, i) => {
            const major = i < 2;
            return (
              <li key={f.id} className={cn(major ? "lg:col-span-3" : "lg:col-span-2", !major && i === features.length - 1 && "sm:col-span-2 lg:col-span-2")}>
                <Reveal delay={i * 60} className="h-full">
                  <article
                    className={cn(
                      "group flex h-full flex-col rounded-[var(--radius-panel)] border border-line bg-panel transition-[border-color,background-color,transform] duration-300 hover:-translate-y-0.5 hover:border-line-strong hover:bg-panel-raised",
                      major ? "p-8 sm:p-10" : "p-7",
                    )}
                  >
                    <span className="grid size-11 place-items-center rounded-xl border border-line-strong text-mist transition-colors duration-300 group-hover:border-mint/40 group-hover:text-mint">
                      <Icon name={f.icon} size={22} />
                    </span>
                    <h3 className={cn("font-wide mt-auto pt-10 font-semibold tracking-tight text-paper", major ? "text-2xl" : "text-lg")}>
                      {f.title}
                    </h3>
                    <p className="mt-2 max-w-[42ch] text-mist">{f.description}</p>
                  </article>
                </Reveal>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
