import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InfoPageContent } from "@/components/pages/InfoPageContent";
import { PlaceholderPage } from "@/components/pages/PlaceholderPage";
import { isPlaceholderSlug, placeholderPages } from "@/data/content";
import { getPageBlocks } from "@/services/content/siteContentService";

// Solo gli slug configurati: qualsiasi altro percorso restituisce 404
export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(placeholderPages).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  if (!isPlaceholderSlug(slug)) return {};
  return { title: placeholderPages[slug], robots: { index: false } };
}

/**
 * Contenuto scritto dall'amministratore (/dashboard/admin/pagine), se c'è;
 * altrimenti lo stesso avviso onesto di prima. Mai una via di mezzo: o la
 * pagina è quella che l'amministratore ha scritto, o dice apertamente che non
 * l'ha ancora fatto.
 */
export default async function InfoPage({ params }: PageProps<"/[slug]">) {
  const { slug } = await params;
  if (!isPlaceholderSlug(slug)) notFound();

  const blocks = await getPageBlocks(slug);
  if (blocks.length === 0) {
    return (
      <PlaceholderPage title={placeholderPages[slug]}>
        <p>Il contenuto di questa pagina è in fase di redazione.</p>
        <p>Sarà pubblicato dopo la revisione legale e societaria.</p>
      </PlaceholderPage>
    );
  }

  return <InfoPageContent title={placeholderPages[slug]} blocks={blocks} />;
}
