/**
 * Corpo delle pagine collegate dal footer (Chi siamo, Contatti, Carriere,
 * Centro assistenza, FAQ, e i testi legali), modificabile dall'amministratore.
 *
 * Ogni pagina è una sequenza di blocchi — testo o immagine — nell'ordine in
 * cui l'amministratore li ha messi. Vive nella STESSA tabella `site_content`
 * usata per i testi della homepage (vedi siteContentService.ts): la chiave di
 * riga ha solo un prefisso diverso (`page:<slug>`), quindi non serve nessuna
 * nuova migrazione né una nuova funzione SQL.
 */
import { sanitizeText } from "@/lib/sanitize";
import { placeholderPages, type PlaceholderSlug } from "./content";

export const MAX_BLOCKS = 30;
export const MAX_TEXT_LENGTH = 5000;
export const MAX_URL_LENGTH = 2000;
export const MAX_ALT_LENGTH = 200;

export interface PageTextBlock {
  type: "text";
  text: string;
}

export interface PageImageBlock {
  type: "image";
  url: string;
  alt: string;
}

export type PageBlock = PageTextBlock | PageImageBlock;

export const editablePageSlugs = Object.keys(placeholderPages) as PlaceholderSlug[];

export function isEditablePageSlug(slug: string): slug is PlaceholderSlug {
  return Object.hasOwn(placeholderPages, slug);
}

export function pageSectionKey(slug: string): string {
  return `page:${slug}`;
}

/** Solo http/https: un URL immagine non è un posto da cui eseguire script. */
function isSafeImageUrl(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

/**
 * Valida un elenco di blocchi arrivato come JSON — dal modulo admin appena
 * inviato, o da quanto già salvato nel database. Una riga non riconosciuta,
 * vuota o con un URL non http(s) viene scartata invece di far fallire
 * l'intero salvataggio o la lettura della pagina pubblica.
 */
export function parsePageBlocks(raw: unknown): PageBlock[] {
  if (!Array.isArray(raw)) return [];

  const blocks: PageBlock[] = [];
  for (const item of raw.slice(0, MAX_BLOCKS)) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;

    if (row.type === "text") {
      const text = sanitizeText(row.text, MAX_TEXT_LENGTH);
      if (text) blocks.push({ type: "text", text });
    } else if (row.type === "image") {
      const url = sanitizeText(row.url, MAX_URL_LENGTH);
      const alt = sanitizeText(row.alt, MAX_ALT_LENGTH);
      if (url && isSafeImageUrl(url)) blocks.push({ type: "image", url, alt });
    }
  }
  return blocks;
}

export type { PlaceholderSlug };
