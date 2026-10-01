"use client";

import { useActionState } from "react";
import { signUpAction } from "@/app/auth/actions";
import { Button } from "@/components/ui/Button";
import { authFormLabels } from "@/data/content";
import type { getSignupForm } from "@/services/content/siteContentService";
import { Field, FormMessages } from "./Field";

type SignupForm = Awaited<ReturnType<typeof getSignupForm>>;

/**
 * Ogni testo visibile arriva da `signup`, caricato dal server a partire da
 * `getSignupForm()` (homepage/[registrati]/page.tsx): così l'amministratore
 * può cambiare etichette e placeholder da /dashboard/admin/contenuti senza
 * toccare questo file.
 */
export function SignUpForm({ signup }: { signup: SignupForm }) {
  const [state, formAction, pending] = useActionState(signUpAction, {});

  return (
    <form action={formAction} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field name="first_name" label={signup.fields.firstName} required autoComplete="given-name" maxLength={80} />
        <Field name="last_name" label={signup.fields.lastName} required autoComplete="family-name" maxLength={80} />
      </div>

      <Field
        name="email"
        label={signup.fields.email}
        type="email"
        required
        autoComplete="email"
        placeholder={signup.fields.emailPlaceholder}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          name="phone"
          label={signup.fields.phone}
          type="tel"
          required
          autoComplete="tel"
          inputMode="tel"
          placeholder={signup.fields.phonePlaceholder}
          maxLength={25}
        />
        <Field name="city" label={signup.fields.city} required autoComplete="address-level2" maxLength={80} />
      </div>

      <Field
        name="amount"
        label={signup.fields.amount}
        type="number"
        required
        min={0}
        step="0.01"
        inputMode="decimal"
        placeholder={signup.fields.amountPlaceholder}
        hint={signup.fields.amountHint}
      />

      <Field
        name="password"
        label={signup.fields.password}
        type="password"
        required
        autoComplete="new-password"
        hint={signup.passwordHint}
      />

      <FormMessages error={state.error} notice={state.notice} />

      <Button type="submit" size="lg" disabled={pending} className="w-full">
        {pending ? authFormLabels.pending : signup.button}
      </Button>
    </form>
  );
}
