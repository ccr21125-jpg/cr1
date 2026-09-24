import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { SiteContentSectionForm } from "@/components/dashboard/SiteContentForm";
import { siteContentPage } from "@/data/content";
import { siteContentSections } from "@/data/siteContentSchema";
import { getAccount } from "@/services/account/accountService";
import { getSiteContentFlat } from "@/services/content/siteContentService";

export const metadata: Metadata = { title: siteContentPage.title };
export const dynamic = "force-dynamic";

/**
 * Pannello "Contenuti sito": un modulo per ogni sezione della homepage.
 *
 * Come per /dashboard/admin, questo controllo nasconde la pagina; a impedire
 * davvero la scrittura sono la policy RLS e `admin_set_site_content`, che un
 * client non può aggirare nemmeno chiamando direttamente le API di Supabase.
 */
export default async function SiteContentAdminPage() {
  const account = await getAccount();
  if (!account) notFound();
  if (!account.isAdmin) notFound();

  const savedBySection = await Promise.all(
    siteContentSections.map((section) => getSiteContentFlat(section.key)),
  );

  return (
    <div className="dash-stack space-y-8">
      <DashboardHeader title={siteContentPage.title} />
      <p className="max-w-2xl text-mist">{siteContentPage.description}</p>

      {siteContentSections.map((section, i) => (
        <SiteContentSectionForm key={section.key} section={section} savedValues={savedBySection[i]!} />
      ))}
    </div>
  );
}
