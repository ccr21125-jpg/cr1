"use server";

import { revalidatePath, updateTag } from "next/cache";
import { adminPage, siteContentPage } from "@/data/content";
import { getSiteContentSection } from "@/data/siteContentSchema";
import { sanitizeText } from "@/lib/sanitize";
import { isSchemaMissing } from "@/lib/supabase/rpcError";
import { getAccount } from "@/services/account/accountService";
import { setSiteContent } from "@/services/admin/adminService";
import { SITE_CONTENT_TAG } from "@/services/content/siteContentService";

export interface SiteContentFormState {
  error?: string;
  success?: string;
}

function messageForCode(code: string): string {
  if (isSchemaMissing(code)) return adminPage.errors.migrationMissing;
  switch (code) {
    case "42501":
      return adminPage.errors.notAuthorised;
    case "22023":
      return adminPage.errors.invalidInput;
    default:
      return `${adminPage.errors.generic} Codice: ${code}`;
  }
}

/**
 * Salva l'intera sezione in un colpo solo: i campi arrivano dallo schema
 * (src/data/siteContentSchema.ts), non da un elenco scritto qui a mano, così
 * un campo aggiunto alla sezione viene salvato senza dover toccare l'azione.
 *
 * Un campo lasciato vuoto non cancella nulla: la lettura (siteContentService)
 * torna al testo di partenza quando trova una stringa vuota, quindi la
 * homepage non mostra mai un titolo o una descrizione bianca.
 */
export async function saveSiteContentAction(
  _prev: SiteContentFormState,
  formData: FormData,
): Promise<SiteContentFormState> {
  // Prima barriera. Quella che conta è dentro `admin_set_site_content`.
  const account = await getAccount();
  if (!account?.isAdmin) return { error: adminPage.errors.notAuthorised };

  const sectionKey = String(formData.get("section_key") ?? "");
  const section = getSiteContentSection(sectionKey);
  if (!section) return { error: adminPage.errors.invalidInput };

  const data: Record<string, string> = {};
  for (const field of section.fields) {
    // Una casella non spuntata non arriva nel FormData: assente = "false".
    data[field.key] =
      field.kind === "checkbox"
        ? String(formData.get(field.key) === "on")
        : sanitizeText(formData.get(field.key), field.maxLength);
  }

  const result = await setSiteContent(sectionKey, data);
  if (!result.ok) return { error: messageForCode(result.code) };

  // updateTag, non revalidateTag: da una Server Action serve l'invalidazione
  // immediata (read-your-own-writes), non quella pianificata per un profilo di
  // cache. Il revalidatePath che segue rigenera subito anche la pagina.
  updateTag(SITE_CONTENT_TAG);
  // Il nome del sito sta nei layout (barra, footer, titolo scheda), non solo nella homepage.
  revalidatePath("/", "layout");
  revalidatePath("/dashboard/admin/contenuti");
  return { success: siteContentPage.saveDone };
}
