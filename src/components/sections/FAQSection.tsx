import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getFaqSection } from "@/services/content/siteContentService";
import { FaqAccordion } from "./FaqAccordion";

/**
 * Ultima obiezione prima dell'invito finale: sta apposta dopo le recensioni e
 * prima della CTA, non in cima alla pagina — risponde ai dubbi di chi ha già
 * visto il resto ed è a un passo dalla registrazione.
 */
export async function FAQSection() {
  const faq = await getFaqSection();

  return (
    <section id="faq" aria-labelledby="faq-title" className="py-24 sm:py-32">
      <Container>
        <SectionHeader id="faq-title" title={faq.title} description={faq.description} />

        <div className="mx-auto mt-12 max-w-2xl">
          <FaqAccordion items={faq.items} />

          <p className="mt-8 text-center">
            <Link
              href={faq.contactHref}
              className="text-mist underline decoration-line-strong underline-offset-4 transition-colors hover:text-paper hover:decoration-mint"
            >
              {faq.contactLabel}
            </Link>
          </p>
        </div>
      </Container>
    </section>
  );
}
