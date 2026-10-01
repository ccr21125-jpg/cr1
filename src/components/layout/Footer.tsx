import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { footerNav, siteConfig } from "@/data/content";
import { getFooterBottom, getLegalDisclaimer } from "@/services/content/siteContentService";
import { Logo } from "./Logo";

export async function Footer({ siteName }: { siteName: string }) {
  const [legalDisclaimer, footerBottom] = await Promise.all([getLegalDisclaimer(), getFooterBottom()]);

  return (
    <footer className="border-t border-line bg-ink">
      <Container className="py-16 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_2fr]">
          <div className="max-w-sm">
            <Logo name={siteName} />
            <p className="mt-5 text-sm text-mist">{siteConfig.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
            {footerNav.map((group) => (
              <nav key={group.title} aria-label={group.title}>
                <h2 className="text-sm font-semibold text-paper">{group.title}</h2>
                <ul className="mt-4 space-y-3">
                  {group.links.map((link) => (
                    <li key={link.href + link.label}>
                      <Link href={link.href} className="text-sm text-mist transition-colors hover:text-paper">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <section aria-labelledby="footer-disclaimer" className="mt-16 rounded-[var(--radius-card)] border border-line p-5 sm:p-6">
          <h2 id="footer-disclaimer" className="text-sm font-semibold text-paper">
            Avvertenza sui rischi
          </h2>
          <div className="mt-3 space-y-2 text-xs leading-relaxed text-mist">
            {legalDisclaimer.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </section>

        <div className="mt-10 flex flex-col gap-3 border-t border-line pt-8 text-xs text-mist sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {siteConfig.copyrightYear} {footerBottom.legalName}. Tutti i diritti riservati.
          </p>
          <p>{footerBottom.companyInfo}</p>
        </div>
      </Container>
    </footer>
  );
}
