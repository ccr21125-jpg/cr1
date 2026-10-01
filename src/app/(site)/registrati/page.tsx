import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthNotConfigured, AuthShell } from "@/components/auth/AuthShell";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { authErrors } from "@/data/content";
import { AFTER_LOGIN_PATH, isSupabaseConfigured } from "@/lib/supabase/config";
import { getCurrentUser } from "@/lib/supabase/server";
import { getSignupForm } from "@/services/content/siteContentService";

export const metadata: Metadata = { title: "Registrati", robots: { index: false } };

/** Dipende dalla sessione: mai prerenderizzata né messa in cache. */
export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  if (isSupabaseConfigured() && (await getCurrentUser())) {
    redirect(AFTER_LOGIN_PATH);
  }

  const signup = await getSignupForm();

  return (
    <AuthShell
      title={signup.title}
      description={signup.description}
      footerPrompt={signup.switchPrompt}
      footerLabel={signup.switchLink}
      footerHref="/accedi"
      note={signup.legalNote}
      wide
    >
      {isSupabaseConfigured() ? (
        <SignUpForm signup={signup} />
      ) : (
        <AuthNotConfigured message={authErrors.notConfigured} />
      )}
    </AuthShell>
  );
}
