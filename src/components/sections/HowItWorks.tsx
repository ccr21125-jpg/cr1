import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getHowItWorksContent, getSteps } from "@/services/content/siteContentService";

/**
 * Timeline: verticale su mobile (linea a sinistra), orizzontale da lg
 * (linea sopra i marker). Le linee sono pseudo-elementi di ogni step,
 * omessi sull'ultimo.
 */
export async function HowItWorks() {
  const [howItWorksContent, steps] = await Promise.all([getHowItWorksContent(), getSteps()]);

  return (
    <section id="come-funziona" aria-labelledby="how-title" className="border-t border-line py-24 sm:py-32">
      <Container>
        <SectionHeader id="how-title" title={howItWorksContent.title} description={howItWorksContent.description} />

        <ol className="mt-14 grid gap-0 lg:grid-cols-4 lg:gap-8">
          {steps.map((step, i) => (
            <li
              key={step.id}
              className="relative pb-10 pl-16 last:pb-0 lg:pb-0 lg:pl-0 lg:pt-16
                before:absolute before:left-[1.4375rem] before:top-12 before:bottom-0 before:w-px before:bg-line-strong last:before:hidden
                lg:before:left-14 lg:before:right-[-2rem] lg:before:top-6 lg:before:bottom-auto lg:before:h-px lg:before:w-auto"
            >
              <span
                aria-hidden="true"
                className="font-wide tabular absolute left-0 top-0 grid size-12 place-items-center rounded-full border border-line-strong bg-panel text-sm font-semibold text-mint"
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <Reveal delay={i * 90}>
                <h3 className="font-wide text-xl font-semibold tracking-tight text-paper">
                  <span className="sr-only">Passaggio {i + 1}: </span>
                  {step.title}
                </h3>
                <p className="mt-2 max-w-[32ch] text-mist">{step.description}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
