import "server-only";
import { cache } from "react";
import {
  faqItems,
  faqSectionContent,
  features,
  finalCtaContent,
  heroContent,
  howItWorksContent,
  legalDisclaimer,
  marketContent,
  multichainContent,
  registerContent,
  reviewsContent,
  signupFieldLabels,
  statsContent,
  steps,
  successContent,
  toolsContent,
} from "@/data/content";
import { isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from "@/lib/supabase/config";
import { pageSectionKey, parsePageBlocks, type PageBlock } from "@/data/pageContentSchema";

/** Tag di cache di Next: la salvataggio dell'amministratore lo invalida per un aggiornamento immediato. */
export const SITE_CONTENT_TAG = "site-content";

interface SiteContentRow {
  section_key: string;
  data: Record<string, unknown>;
}

/**
 * Legge tutte le sezioni salvate con una `fetch` diretta a PostgREST, non con
 * il client Supabase basato sui cookie.
 *
 * La homepage oggi è generata staticamente (nessuna chiamata che dipenda dai
 * cookie): usare qui `createSupabaseServerClient()`, che legge `cookies()`,
 * la farebbe diventare dinamica ad ogni richiesta. Una `fetch` semplice non
 * tocca i cookie, quindi Next la mette nella propria cache dei dati con lo
 * stesso `revalidate`/tag di qualunque altra richiesta — la pagina resta
 * statica, e si rigenera da sola ogni minuto o subito dopo un salvataggio.
 */
const fetchSiteContentRows = cache(async (): Promise<SiteContentRow[]> => {
  if (!isSupabaseConfigured()) return [];

  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/site_content?select=section_key,data`, {
      headers: {
        apikey: supabaseAnonKey!,
        authorization: `Bearer ${supabaseAnonKey}`,
      },
      next: { revalidate: 60, tags: [SITE_CONTENT_TAG] },
    });
    if (!res.ok) return [];
    const rows: unknown = await res.json();
    return Array.isArray(rows) ? (rows as SiteContentRow[]) : [];
  } catch {
    // Rete assente, tabella non ancora creata, Supabase non raggiungibile:
    // la homepage torna ai testi di src/data/content.ts, mai una pagina rotta.
    return [];
  }
});

/** Le sovrascritture di una sezione, o un oggetto vuoto se non c'è ancora nulla di salvato. */
export async function getSiteContentFlat(sectionKey: string): Promise<Record<string, string>> {
  const rows = await fetchSiteContentRows();
  const row = rows.find((r) => r.section_key === sectionKey);
  if (!row || typeof row.data !== "object" || row.data === null) return {};

  const flat: Record<string, string> = {};
  for (const [key, value] of Object.entries(row.data)) {
    if (typeof value === "string") flat[key] = value;
  }
  return flat;
}

/** Prende un campo salvato, o il testo di partenza se non è mai stato toccato. */
function pick(flat: Record<string, string>, key: string, fallback: string): string {
  const value = flat[key];
  return value !== undefined && value !== "" ? value : fallback;
}

export async function getHeroContent() {
  const flat = await getSiteContentFlat("hero");
  return {
    title: pick(flat, "title", heroContent.title),
    description: pick(flat, "description", heroContent.description),
    note: pick(flat, "note", heroContent.note),
  };
}

export async function getMarketContent() {
  const flat = await getSiteContentFlat("market");
  return {
    title: pick(flat, "title", marketContent.title),
    description: pick(flat, "description", marketContent.description),
  };
}

export async function getSuccessContent() {
  const flat = await getSiteContentFlat("success");
  return {
    title: pick(flat, "title", successContent.title),
    subtitle: pick(flat, "subtitle", successContent.subtitle),
    body: [
      pick(flat, "body_1", successContent.body[0] ?? ""),
      pick(flat, "body_2", successContent.body[1] ?? ""),
    ],
    verifiedMetric: successContent.verifiedMetric,
    placeholderLabel: pick(flat, "placeholderLabel", successContent.placeholderLabel),
    placeholderHint: pick(flat, "placeholderHint", successContent.placeholderHint),
    flow: successContent.flow.map((step, i) => ({
      title: pick(flat, `flow_${i + 1}_title`, step.title),
      detail: pick(flat, `flow_${i + 1}_detail`, step.detail),
    })),
    disclaimer: pick(flat, "disclaimer", successContent.disclaimer),
  };
}

export async function getMultichainContent() {
  const flat = await getSiteContentFlat("multichain");
  return {
    title: pick(flat, "title", multichainContent.title),
    description: pick(flat, "description", multichainContent.description),
    hubLabel: pick(flat, "hubLabel", multichainContent.hubLabel),
    hubDetail: pick(flat, "hubDetail", multichainContent.hubDetail),
    moreLabel: pick(flat, "moreLabel", multichainContent.moreLabel),
  };
}

export async function getToolsContent() {
  const flat = await getSiteContentFlat("tools");
  return {
    title: pick(flat, "title", toolsContent.title),
    description: pick(flat, "description", toolsContent.description),
  };
}

/** Stessa forma di `features`: id e icona restano fissi, cambia solo il testo. */
export async function getFeatures() {
  const flat = await getSiteContentFlat("tools");
  return features.map((f) => ({
    ...f,
    title: pick(flat, `${f.id}_title`, f.title),
    description: pick(flat, `${f.id}_description`, f.description),
  }));
}

export async function getHowItWorksContent() {
  const flat = await getSiteContentFlat("how_it_works");
  return {
    title: pick(flat, "title", howItWorksContent.title),
    description: pick(flat, "description", howItWorksContent.description),
  };
}

/** Stessa forma di `steps`: id e ordine restano fissi, cambia solo il testo. */
export async function getSteps() {
  const flat = await getSiteContentFlat("how_it_works");
  return steps.map((s) => ({
    ...s,
    title: pick(flat, `${s.id}_title`, s.title),
    description: pick(flat, `${s.id}_description`, s.description),
  }));
}

export async function getStatsContent() {
  const flat = await getSiteContentFlat("stats");
  return {
    title: pick(flat, "title", statsContent.title),
    description: pick(flat, "description", statsContent.description),
    demoBadgeLabel: pick(flat, "demoBadgeLabel", statsContent.demoBadgeLabel),
  };
}

export async function getReviewsContent() {
  const flat = await getSiteContentFlat("reviews");
  return {
    title: pick(flat, "title", reviewsContent.title),
    demoNote: pick(flat, "demoNote", reviewsContent.demoNote),
    demoBadgeLabel: pick(flat, "demoBadgeLabel", reviewsContent.demoBadgeLabel),
  };
}

export async function getFaqSection() {
  const flat = await getSiteContentFlat("faq_section");
  return {
    title: pick(flat, "title", faqSectionContent.title),
    description: pick(flat, "description", faqSectionContent.description),
    contactLabel: pick(flat, "contactLabel", faqSectionContent.contactLabel),
    contactHref: faqSectionContent.contactHref,
    items: faqItems.map((item, i) => ({
      q: pick(flat, `q_${i + 1}`, item.q),
      a: pick(flat, `a_${i + 1}`, item.a),
    })),
  };
}

export async function getFinalCtaContent() {
  const flat = await getSiteContentFlat("final_cta");
  return {
    title: pick(flat, "title", finalCtaContent.title),
    description: pick(flat, "description", finalCtaContent.description),
  };
}

export async function getLegalDisclaimer(): Promise<string[]> {
  const flat = await getSiteContentFlat("legal");
  return legalDisclaimer.map((line, i) => pick(flat, `line_${i + 1}`, line));
}

export async function getSignupForm() {
  const flat = await getSiteContentFlat("signup_form");
  return {
    title: pick(flat, "title", registerContent.title),
    description: pick(flat, "description", registerContent.description),
    button: pick(flat, "button", registerContent.button),
    switchPrompt: pick(flat, "switchPrompt", registerContent.switchPrompt),
    switchLink: pick(flat, "switchLink", registerContent.switchLink),
    passwordHint: pick(flat, "passwordHint", registerContent.passwordHint),
    legalNote: pick(flat, "legalNote", registerContent.legalNote),
    fields: {
      firstName: pick(flat, "firstName", signupFieldLabels.firstName),
      lastName: pick(flat, "lastName", signupFieldLabels.lastName),
      email: pick(flat, "email", signupFieldLabels.email),
      emailPlaceholder: pick(flat, "emailPlaceholder", signupFieldLabels.emailPlaceholder),
      phone: pick(flat, "phone", signupFieldLabels.phone),
      phonePlaceholder: pick(flat, "phonePlaceholder", signupFieldLabels.phonePlaceholder),
      city: pick(flat, "city", signupFieldLabels.city),
      amount: pick(flat, "amount", signupFieldLabels.amount),
      amountPlaceholder: pick(flat, "amountPlaceholder", signupFieldLabels.amountPlaceholder),
      amountHint: pick(flat, "amountHint", signupFieldLabels.amountHint),
      password: pick(flat, "password", signupFieldLabels.password),
    },
  };
}

/**
 * Blocchi di una pagina del footer (Chi siamo, Contatti, …), o un array vuoto
 * finché l'amministratore non ha ancora scritto nulla: la pagina pubblica lo
 * distingue mostrando l'avviso "in preparazione" invece di una pagina vuota.
 */
export async function getPageBlocks(slug: string): Promise<PageBlock[]> {
  const rows = await fetchSiteContentRows();
  const row = rows.find((r) => r.section_key === pageSectionKey(slug));
  const raw = row?.data && typeof row.data === "object" ? (row.data as Record<string, unknown>).blocks : undefined;
  return parsePageBlocks(raw);
}
