import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { authLinks } from "@/data/content";
import { getFinalCtaContent } from "@/services/content/siteContentService";

export async function FinalCTA() {
  const finalCtaContent = await getFinalCtaContent();

  return (
    <section aria-labelledby="cta-title" className="pb-24 sm:pb-32">
      <Container>
        <Reveal>
          <div className="panel relative isolate overflow-hidden px-6 py-14 sm:px-12 sm:py-20">
            <div aria-hidden="true" className="bg-grid absolute inset-0 -z-10 opacity-80" />
            <div aria-hidden="true" className="absolute -right-24 -top-32 -z-10 size-[420px] rounded-full bg-mint/[0.06] blur-[100px]" />
            <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <h2 id="cta-title" className="font-display text-[clamp(2rem,4.6vw,3.5rem)] leading-[1.02] text-balance">
                  {finalCtaContent.title}
                </h2>
                <p className="mt-5 max-w-lg text-lg text-mist">{finalCtaContent.description}</p>
              </div>
              <div className="flex flex-col gap-3 min-[420px]:flex-row">
                <ButtonLink href={authLinks.register.href} size="lg">
                  {authLinks.register.label}
                </ButtonLink>
                <ButtonLink href={authLinks.login.href} variant="secondary" size="lg">
                  {authLinks.login.label}
                </ButtonLink>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
