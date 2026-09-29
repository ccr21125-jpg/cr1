import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { PageContentForm } from "@/components/dashboard/PageContentForm";
import { pagesAdminContent, placeholderPages } from "@/data/content";
import { editablePageSlugs } from "@/data/pageContentSchema";
import { getAccount } from "@/services/account/accountService";
import { getPageBlocks } from "@/services/content/siteContentService";

export const metadata: Metadata = { title: pagesAdminContent.title };
export const dynamic = "force-dynamic";

/**
 * Pannello "Pagine del sito": un editor a blocchi per ognuna delle pagine
 * collegate dal footer. Come per /dashboard/admin, questo controllo nasconde
 * la pagina; a impedire davvero la scrittura sono la policy RLS e
 * `admin_set_site_content`, che un client non può aggirare.
 */
export default async function PagesAdminPage() {
  const account = await getAccount();
  if (!account) notFound();
  if (!account.isAdmin) notFound();

  const blocksBySlug = await Promise.all(editablePageSlugs.map((slug) => getPageBlocks(slug)));

  return (
    <div className="dash-stack space-y-8">
      <DashboardHeader title={pagesAdminContent.title} />
      <p className="max-w-2xl text-mist">{pagesAdminContent.description}</p>

      {editablePageSlugs.map((slug, i) => (
        <PageContentForm key={slug} slug={slug} label={placeholderPages[slug]} initialBlocks={blocksBySlug[i]!} />
      ))}
    </div>
  );
}
