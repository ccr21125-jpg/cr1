/**
 * ============================================================================
 * QUALI TESTI DEL SITO L'AMMINISTRATORE PUÒ MODIFICARE.
 *
 * Ogni sezione qui sotto corrisponde a una riga di `site_content` (chiave =
 * `key`) e a un modulo nel pannello /dashboard/admin/contenuti. I valori di
 * partenza (`defaults`) sono presi da src/data/content.ts: finché
 * l'amministratore non salva nulla per una sezione, il sito mostra
 * esattamente questi testi, invariati rispetto a oggi. Copre sia la homepage
 * sia, più avanti nel file, il modulo di registrazione.
 *
 * Gli array a lunghezza fissa (funzionalità, passaggi, paragrafi, campi di un
 * modulo) sono "appiattiti" in chiavi singole (es. "flow_1_title") invece di
 * restare annidati: così il modulo di modifica è una lista di campi di
 * testo, non un editor di struttura. L'amministratore cambia le PAROLE, non
 * l'elenco delle sezioni, quante voci contiene o quali campi esistono.
 * ============================================================================
 */
import {
  faqItems,
  faqSectionContent,
  features,
  finalCtaContent,
  heroContent,
  howItWorksContent,
  footerBottomContent,
  legalDisclaimer,
  marketContent,
  multichainContent,
  registerContent,
  siteConfig,
  signupFieldLabels,
  statsContent,
  steps,
  successContent,
  toolsContent,
} from "./content";
import { mockStats } from "./stats.mock";

export interface SiteContentField {
  /** Chiave nell'oggetto JSON salvato per questa sezione. */
  key: string;
  label: string;
  /** "checkbox" si salva come "true" / "false". */
  kind: "text" | "textarea" | "checkbox";
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
    key: "brand",
    label: "Nome del sito",
    description:
      "Compare accanto al logo (barra in alto, footer, area riservata e pagina 404). Il logo non cambia. Compare anche nella riga di copyright del footer, a meno che in \"Testo legale (footer)\" non sia indicata una ragione sociale diversa.",
    fields: [{ key: "name", label: "Nome del sito", kind: "text", maxLength: 60 }],
    defaults: { name: siteConfig.name },
  },
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
      { key: "metricValue", label: "Metrica — numero (senza %)", kind: "text", maxLength: 6 },
      { key: "metricLabel", label: "Metrica — etichetta", kind: "text", maxLength: 100 },
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
      metricValue: successContent.metricValue,
      metricLabel: successContent.metricLabel,
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
    description:
      "Titolo, numeri, unità ed etichette delle cinque statistiche. Il numero si scrive senza separatore delle migliaia e con la virgola per i decimali (es. 25000 oppure 1,2). Togli la spunta da «Dato dimostrativo» solo per cifre vere e verificate: allora sotto al numero compare la fonte, e l'etichetta gialla in alto sparisce quando nessuna cifra è più dimostrativa.",
    fields: [
      { key: "title", label: "Titolo", kind: "text", maxLength: 100 },
      { key: "description", label: "Descrizione", kind: "textarea", maxLength: 200 },
      { key: "demoBadgeLabel", label: "Etichetta dati dimostrativi", kind: "text", maxLength: 80 },
      ...mockStats.flatMap((s): SiteContentField[] => [
        { key: `${s.id}_value`, label: `${s.label} — numero`, kind: "text", maxLength: 14 },
        { key: `${s.id}_suffix`, label: `${s.label} — unità dopo il numero (es. +, %, Mld $)`, kind: "text", maxLength: 12 },
        { key: `${s.id}_label`, label: `${s.label} — etichetta`, kind: "text", maxLength: 60 },
        { key: `${s.id}_demo`, label: `${s.label} — dato dimostrativo`, kind: "checkbox", maxLength: 5 },
        { key: `${s.id}_source`, label: `${s.label} — fonte (mostrata se non dimostrativo)`, kind: "text", maxLength: 100 },
      ]),
    ],
    defaults: {
      title: statsContent.title,
      description: statsContent.description,
      demoBadgeLabel: statsContent.demoBadgeLabel,
      ...Object.fromEntries(mockStats.flatMap((s) => [
        [`${s.id}_value`, String(s.value).replace(".", ",")],
        [`${s.id}_suffix`, (s.suffix ?? "").replace(/\u00a0/g, " ").trim()],
        [`${s.id}_label`, s.label],
        [`${s.id}_demo`, String(s.isDemo)],
        [`${s.id}_source`, s.source ?? ""],
      ])),
    },
  },
  {
    key: "faq_section",
    label: "Domande frequenti (homepage)",
    description: "Il numero di domande resta fisso: qui si modifica solo il testo di ciascuna.",
    fields: [
      { key: "title", label: "Titolo", kind: "text", maxLength: 100 },
      { key: "description", label: "Descrizione", kind: "textarea", maxLength: 200 },
      { key: "contactLabel", label: "Testo del link di contatto", kind: "text", maxLength: 100 },
      ...faqItems.flatMap((_, i): SiteContentField[] => [
        { key: `q_${i + 1}`, label: `Domanda ${i + 1}`, kind: "text", maxLength: 150 },
        { key: `a_${i + 1}`, label: `Risposta ${i + 1}`, kind: "textarea", maxLength: 500 },
      ]),
    ],
    defaults: {
      title: faqSectionContent.title,
      description: faqSectionContent.description,
      contactLabel: faqSectionContent.contactLabel,
      ...Object.fromEntries(faqItems.flatMap((item, i) => [
        [`q_${i + 1}`, item.q],
        [`a_${i + 1}`, item.a],
      ])),
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
    fields: [
      ...legalDisclaimer.map((_, i): SiteContentField => ({
        key: `line_${i + 1}`,
        label: `Paragrafo ${i + 1}`,
        kind: "textarea",
        maxLength: 600,
        sensitive: true,
      })),
      {
        key: "legalName",
        label: "Ragione sociale (riga di copyright) — lascia vuoto per usare il nome del sito",
        kind: "text",
        maxLength: 150,
        sensitive: true,
      },
      {
        key: "companyInfo",
        label: "Sede legale, P.IVA e dati societari",
        kind: "textarea",
        maxLength: 300,
        sensitive: true,
      },
    ],
    defaults: {
      ...Object.fromEntries(legalDisclaimer.map((line, i) => [`line_${i + 1}`, line])),
      legalName: "",
      companyInfo: footerBottomContent.companyInfo,
    },
  },
  {
    key: "signup_form",
    label: "Modulo di registrazione",
    description:
      "Testi, etichette ed esempi del modulo che i nuovi utenti compilano per creare un account. L'etichetta \"Email\" e \"Password\" sono una copia propria: cambiarle qui non tocca la pagina di accesso.",
    fields: [
      { key: "title", label: "Titolo della pagina", kind: "text", maxLength: 100 },
      { key: "description", label: "Sottotitolo della pagina", kind: "textarea", maxLength: 200 },
      { key: "button", label: "Testo del pulsante di invio", kind: "text", maxLength: 60 },
      { key: "switchPrompt", label: "Testo prima del link verso l'accesso", kind: "text", maxLength: 80 },
      { key: "switchLink", label: "Testo del link verso l'accesso", kind: "text", maxLength: 40 },
      { key: "passwordHint", label: "Suggerimento sotto il campo password", kind: "text", maxLength: 100 },
      { key: "legalNote", label: "Nota legale sotto al modulo", kind: "textarea", maxLength: 400, sensitive: true },
      { key: "firstName", label: "Etichetta campo Nome", kind: "text", maxLength: 40 },
      { key: "lastName", label: "Etichetta campo Cognome", kind: "text", maxLength: 40 },
      { key: "email", label: "Etichetta campo Email", kind: "text", maxLength: 40 },
      { key: "emailPlaceholder", label: "Esempio nel campo Email", kind: "text", maxLength: 60 },
      { key: "phone", label: "Etichetta campo Telefono", kind: "text", maxLength: 40 },
      { key: "phonePlaceholder", label: "Esempio nel campo Telefono", kind: "text", maxLength: 60 },
      { key: "city", label: "Etichetta campo Città", kind: "text", maxLength: 40 },
      { key: "amount", label: "Etichetta campo Somma", kind: "text", maxLength: 40 },
      { key: "amountPlaceholder", label: "Esempio nel campo Somma", kind: "text", maxLength: 40 },
      { key: "amountHint", label: "Suggerimento sotto il campo Somma", kind: "textarea", maxLength: 200 },
      { key: "password", label: "Etichetta campo Password", kind: "text", maxLength: 40 },
    ],
    defaults: {
      title: registerContent.title,
      description: registerContent.description,
      button: registerContent.button,
      switchPrompt: registerContent.switchPrompt,
      switchLink: registerContent.switchLink,
      passwordHint: registerContent.passwordHint,
      legalNote: registerContent.legalNote,
      firstName: signupFieldLabels.firstName,
      lastName: signupFieldLabels.lastName,
      email: signupFieldLabels.email,
      emailPlaceholder: signupFieldLabels.emailPlaceholder,
      phone: signupFieldLabels.phone,
      phonePlaceholder: signupFieldLabels.phonePlaceholder,
      city: signupFieldLabels.city,
      amount: signupFieldLabels.amount,
      amountPlaceholder: signupFieldLabels.amountPlaceholder,
      amountHint: signupFieldLabels.amountHint,
      password: signupFieldLabels.password,
    },
  },
];

export function getSiteContentSection(key: string): SiteContentSection | undefined {
  return siteContentSections.find((s) => s.key === key);
}
