import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { authLinks } from "@/data/content";
import { getHeroContent } from "@/services/content/siteContentService";

/**
 * Tracciato decorativo (non un dato di mercato): una linea che attraversa
 * il reticolo e viene "disegnata" al caricamento. È l'unica animazione
 * automatica della pagina.
 */
const TRACE =
  "M0 250 L90 238 L160 246 L240 214 L310 222 L380 190 L450 204 L520 168 L600 176 L680 132 L740 148 L820 110 L900 118 L980 84 L1060 96 L1140 58 L1200 64";

export async function Hero() {
  const heroContent = await getHeroContent();

  return (
    <section aria-labelledby="hero-title" className="relative isolate overflow-hidden">
      <div aria-hidden="true" className="bg-grid absolute inset-0 -z-10" />
      <div
        aria-hidden="true"
        className="absolute -top-40 left-[-10%] -z-10 h-[520px] w-[720px] rounded-full bg-mint/[0.07] blur-[120px]"
      />
      <svg
        aria-hidden="true"
        viewBox="0 0 1200 280"
        preserveAspectRatio="none"
        className="absolute inset-x-0 bottom-10 -z-10 hidden h-[38%] w-full opacity-60 sm:block [mask-image:linear-gradient(to_right,transparent,black_35%,black_85%,transparent)]"
      >
        <path
          d={TRACE}
          fill="none"
          stroke="var(--color-mint)"
          strokeWidth="1.25"
          strokeOpacity="0.55"
          vectorEffect="non-scaling-stroke"
          pathLength={1}
          strokeDasharray="1"
          className="animate-draw"
        />
      </svg>

      <Container className="pb-24 pt-20 sm:pb-32 sm:pt-28 lg:pb-40 lg:pt-36">
        <h1
          id="hero-title"
          className="font-display max-w-[11ch] animate-rise text-[clamp(2.9rem,8.4vw,7rem)] leading-[0.94] text-paper text-balance"
        >
          {heroContent.title}
        </h1>

        <p
          className="mt-8 max-w-[44ch] animate-rise text-lg text-mist text-pretty [animation-delay:120ms] sm:text-xl"
        >
          {heroContent.description}
        </p>

        <div className="mt-10 flex animate-rise flex-col gap-3 [animation-delay:220ms] min-[420px]:flex-row">
          <ButtonLink href={authLinks.login.href} variant="secondary" size="lg">
            {authLinks.login.label}
          </ButtonLink>
          <ButtonLink href={authLinks.register.href} variant="primary" size="lg">
            {authLinks.register.label}
          </ButtonLink>
        </div>

        <p className="mt-6 max-w-md animate-rise text-xs text-mist/80 [animation-delay:300ms]">{heroContent.note}</p>
      </Container>
    </section>
  );
}
