/**
 * ============================================================================
 * QUALI TESTI DELLA HOMEPAGE L'AMMINISTRATORE PUÒ MODIFICARE.
 *
 * Ogni sezione qui sotto corrisponde a una riga di `site_content` (chiave =
 * `key`) e a un modulo nel pannello /dashboard/admin/contenuti. I valori di
 * partenza (`defaults`) sono presi da src/data/content.ts: finché
 * l'amministratore non salva nulla per una sezione, la homepage mostra
 * esattamente questi testi, invariati rispetto a oggi.
 *
 * Gli array a lunghezza fissa (funzionalità, passaggi, paragrafi) sono
 * "appiattiti" in chiavi singole (es. "flow_1_title") invece di restare
 * annidati: così il modulo di modifica è una lista di campi di testo, non un
 * editor di struttura. L'amministratore cambia le PAROLE, non l'elenco delle
 * sezioni o quante voci contiene.
 * ============================================================================
 */
import {
  features,
  finalCtaContent,
  heroContent,
  howItWorksContent,
  legalDisclaimer,
  marketContent,
  multichainContent,
  reviewsContent,
  statsContent,
  steps,
  successContent,
  toolsContent,
} from "./content";

export interface SiteContentField {
  /** Chiave nell'oggetto JSON salvato per questa sezione. */
  key: string;
  label: string;
  kind: "text" | "textarea";
  maxLength: number;
  /** Testo con implicazioni legali/di conformità: il modulo mostra un avviso. */
  sensitive?: boolean;
}

export interface SiteContentSection {
  /** Chiave di riga in `site_content`. */
  key: string;
  label: string;
  description?: string;
  fields: SiteContentField[];
  defaults: Record<string, string>;
}

export const siteContentSections: SiteContentSection[] = [
  {
    key: "hero",
    label: "Sezione iniziale (Hero)",
    fields: [
      { key: "title", label: "Titolo", kind: "text", maxLength: 120 },
      { key: "description", label: "Descrizione", kind: "textarea", maxLength: 300 },
      { key: "note", label: "Nota sui rischi", kind: "textarea", maxLength: 200, sensitive: true },
    ],
    defaults: {
      title: heroContent.title,
      description: heroContent.description,
      note: heroContent.note,
    },
  },
  {
    key: "market",
    label: "Principali asset crypto",
    fields: [
      { key: "title", label: "Titolo", kind: "text", maxLength: 100 },
      { key: "description", label: "Descrizione", kind: "textarea", maxLength: 200 },
    ],
    defaults: {
      title: marketContent.title,
      description: marketContent.description,
    },
  },
  {
    key: "success",
    label: "Tasso di successo",
    fields: [
      { key: "title", label: "Titolo", kind: "text", maxLength: 120 },
      { key: "subtitle", label: "Sottotitolo", kind: "textarea", maxLength: 200 },
      { key: "body_1", label: "Paragrafo 1", kind: "textarea", maxLength: 400 },
      { key: "body_2", label: "Paragrafo 2", kind: "textarea", maxLength: 400 },
      { key: "placeholderLabel", label: "Segnaposto metrica — etichetta", kind: "text", maxLength: 100 },
      { key: "placeholderHint", label: "Segnaposto metrica — testo", kind: "textarea", maxLength: 200 },
      { key: "flow_1_title", label: "Passaggio 1 — titolo", kind: "text", maxLength: 60 },
      { key: "flow_1_detail", label: "Passaggio 1 — dettaglio", kind: "text", maxLength: 120 },
      { key: "flow_2_title", label: "Passaggio 2 — titolo", kind: "text", maxLength: 60 },
      { key: "flow_2_detail", label: "Passaggio 2 — dettaglio", kind: "text", maxLength: 120 },
      { key: "flow_3_title", label: "Passaggio 3 — titolo", kind: "text", maxLength: 60 },
      { key: "flow_3_detail", label: "Passaggio 3 — dettaglio", kind: "text", maxLength: 120 },
      { key: "flow_4_title", label: "Passaggio 4 — titolo", kind: "text", maxLength: 60 },
      { key: "flow_4_detail", label: "Passaggio 4 — dettaglio", kind: "text", maxLength: 120 },
      { key: "disclaimer", label: "Disclaimer", kind: "textarea", maxLength: 300, sensitive: true },
    ],
    defaults: {
      title: successContent.title,
      subtitle: successContent.subtitle,
      body_1: successContent.body[0] ?? "",
      body_2: successContent.body[1] ?? "",
      placeholderLabel: successContent.placeholderLabel,
      placeholderHint: successContent.placeholderHint,
      flow_1_title: successContent.flow[0]?.title ?? "",
      flow_1_detail: successContent.flow[0]?.detail ?? "",
      flow_2_title: successContent.flow[1]?.title ?? "",
      flow_2_detail: successContent.flow[1]?.detail ?? "",
      flow_3_title: successContent.flow[2]?.title ?? "",
      flow_3_detail: successContent.flow[2]?.detail ?? "",
      flow_4_title: successContent.flow[3]?.title ?? "",
      flow_4_detail: successContent.flow[3]?.detail ?? "",
      disclaimer: successContent.disclaimer,
    },
  },
  {
    key: "multichain",
    label: "Copertura multichain",
    fields: [
      { key: "title", label: "Titolo", kind: "text", maxLength: 100 },
      { key: "description", label: "Descrizione", kind: "textarea", maxLength: 250 },
      { key: "hubLabel", label: "Etichetta hub centrale", kind: "text", maxLength: 60 },
      { key: "hubDetail", label: "Dettaglio hub centrale", kind: "text", maxLength: 100 },
      { key: "moreLabel", label: "Nota sotto al diagramma", kind: "textarea", maxLength: 200 },
    ],
    defaults: {
      title: multichainContent.title,
      description: multichainContent.description,
      hubLabel: multichainContent.hubLabel,
      hubDetail: multichainContent.hubDetail,
      moreLabel: multichainContent.moreLabel,
    },
  },
  {
    key: "tools",
    label: "Strumenti per il trading",
    description: "Le icone e l'ordine restano fissi: qui si modifica solo il testo di ciascuna scheda.",
    fields: [
      { key: "title", label: "Titolo sezione", kind: "text", maxLength: 100 },
      { key: "description", label: "Descrizione sezione", kind: "textarea", maxLength: 200 },
      ...features.flatMap((f): SiteContentField[] => [
        { key: `${f.id}_title`, label: `${f.title} — titolo`, kind: "text", maxLength: 60 },
        { key: `${f.id}_description`, label: `${f.title} — descrizione`, kind: "textarea", maxLength: 200 },
      ]),
    ],
    defaults: {
      title: toolsContent.title,
      description: toolsContent.description,
      ...Object.fromEntries(features.flatMap((f) => [
        [`${f.id}_title`, f.title],
        [`${f.id}_description`, f.description],
      ])),
    },
  },
  {
    key: "how_it_works",
    label: "Come funziona",
    description: "L'ordine dei passaggi resta fisso: qui si modifica solo il testo di ciascuno.",
    fields: [
      { key: "title", label: "Titolo sezione", kind: "text", maxLength: 100 },
      { key: "description", label: "Descrizione sezione", kind: "textarea", maxLength: 200 },
      ...steps.flatMap((s): SiteContentField[] => [
        { key: `${s.id}_title`, label: `${s.title} — titolo`, kind: "text", maxLength: 60 },
        { key: `${s.id}_description`, label: `${s.title} — descrizione`, kind: "textarea", maxLength: 150 },
      ]),
    ],
    defaults: {
      title: howItWorksContent.title,
      description: howItWorksContent.description,
      ...Object.fromEntries(steps.flatMap((s) => [
        [`${s.id}_title`, s.title],
        [`${s.id}_description`, s.description],
      ])),
    },
  },
  {
    key: "stats",
    label: "Statistiche",
    description: "I numeri restano quelli configurati a parte: qui si modificano solo titolo e note.",
    fields: [
      { key: "title", label: "Titolo", kind: "text", maxLength: 100 },
      { key: "description", label: "Descrizione", kind: "textarea", maxLength: 200 },
      { key: "demoBadgeLabel", label: "Etichetta dati dimostrativi", kind: "text", maxLength: 80 },
    ],
    defaults: {
      title: statsContent.title,
      description: statsContent.description,
      demoBadgeLabel: statsContent.demoBadgeLabel,
    },
  },
  {
    key: "reviews",
    label: "Recensioni",
    description: "L'elenco delle recensioni resta quello configurato a parte: qui si modifica solo l'intestazione.",
    fields: [
      { key: "title", label: "Titolo", kind: "text", maxLength: 100 },
      { key: "demoNote", label: "Nota recensioni dimostrative", kind: "textarea", maxLength: 200 },
      { key: "demoBadgeLabel", label: "Etichetta dati dimostrativi", kind: "text", maxLength: 80 },
    ],
    defaults: {
      title: reviewsContent.title,
      demoNote: reviewsContent.demoNote,
      demoBadgeLabel: reviewsContent.demoBadgeLabel,
    },
  },
  {
    key: "final_cta",
    label: "Invito finale",
    fields: [
      { key: "title", label: "Titolo", kind: "text", maxLength: 120 },
      { key: "description", label: "Descrizione", kind: "textarea", maxLength: 250 },
    ],
    defaults: {
      title: finalCtaContent.title,
      description: finalCtaContent.description,
    },
  },
  {
    key: "legal",
    label: "Testo legale (footer)",
    description: "Compare in fondo a ogni pagina del sito pubblico.",
    fields: legalDisclaimer.map((_, i): SiteContentField => ({
      key: `line_${i + 1}`,
      label: `Paragrafo ${i + 1}`,
      kind: "textarea",
      maxLength: 600,
      sensitive: true,
    })),
    defaults: Object.fromEntries(legalDisclaimer.map((line, i) => [`line_${i + 1}`, line])),
  },
];

export function getSiteContentSection(key: string): SiteContentSection | undefined {
  return siteContentSections.find((s) => s.key === key);
}
