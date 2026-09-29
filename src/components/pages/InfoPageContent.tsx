import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import type { PageBlock } from "@/data/pageContentSchema";

/**
 * Pagina scritta dall'amministratore: titolo fisso (quello del footer) e i
 * blocchi nell'ordine scelto in /dashboard/admin/pagine. Le immagini arrivano
 * da un URL scelto dall'amministratore, non da asset del sito — <img>
 * qui è corretto, `next/image` richiederebbe di autorizzare in anticipo
 * ogni possibile dominio.
 */
export function InfoPageContent({ title, blocks }: { title: string; blocks: PageBlock[] }) {
  return (
    <Container className="py-24 sm:py-32">
      <h1 className="font-display max-w-[16ch] text-[clamp(2.25rem,5vw,3.75rem)] leading-[1.02] text-balance">
        {title}
      </h1>

      <div className="mt-8 max-w-2xl space-y-6">
        {blocks.map((block, i) =>
          block.type === "text" ? (
            <p key={i} className="text-lg leading-relaxed text-mist text-pretty">
              {block.text}
            </p>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={block.url}
              alt={block.alt}
              className="w-full rounded-[var(--radius-panel)] border border-line object-cover"
            />
          ),
        )}
      </div>

      <ButtonLink href="/" variant="secondary" className="mt-10">
        Torna alla home
      </ButtonLink>
    </Container>
  );
}
