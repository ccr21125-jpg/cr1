"use server";

import { revalidatePath, updateTag } from "next/cache";
import { adminPage, pagesAdminContent } from "@/data/content";
import { isEditablePageSlug, pageSectionKey, parsePageBlocks } from "@/data/pageContentSchema";
import { isSchemaMissing } from "@/lib/supabase/rpcError";
import { getAccount } from "@/services/account/accountService";
import { setSiteContent } from "@/services/admin/adminService";
import { SITE_CONTENT_TAG } from "@/services/content/siteContentService";

export interface PageContentFormState {
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
 * Salva l'intera pagina in un colpo solo: i blocchi arrivano dal modulo come
 * JSON (l'ordine è quello scelto lì), vengono rivalidati qui — mai fidarsi
 * ciecamente di un campo nascosto — e sostituiscono per intero quanto salvato
 * in precedenza, non un blocco alla volta.
 */
export async function savePageContentAction(
  _prev: PageContentFormState,
  formData: FormData,
): Promise<PageContentFormState> {
  // Prima barriera. Quella che conta è dentro `admin_set_site_content`.
  const account = await getAccount();
  if (!account?.isAdmin) return { error: adminPage.errors.notAuthorised };

  const slug = String(formData.get("slug") ?? "");
  if (!isEditablePageSlug(slug)) return { error: adminPage.errors.invalidInput };

  let rawBlocks: unknown;
  try {
    rawBlocks = JSON.parse(String(formData.get("blocks") ?? "[]"));
  } catch {
    return { error: adminPage.errors.invalidInput };
  }
  const blocks = parsePageBlocks(rawBlocks);

  const result = await setSiteContent(pageSectionKey(slug), { blocks });
  if (!result.ok) return { error: messageForCode(result.code) };

  updateTag(SITE_CONTENT_TAG);
  revalidatePath(`/${slug}`);
  revalidatePath("/dashboard/admin/pagine");
  return { success: pagesAdminContent.saveDone };
}
