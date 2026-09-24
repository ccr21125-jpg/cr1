"use client";

import { useActionState } from "react";
import { saveSiteContentAction, type SiteContentFormState } from "@/app/dashboard/admin/contenuti/actions";
import { Icon } from "@/components/icons/Icon";
import { Button } from "@/components/ui/Button";
import { siteContentPage } from "@/data/content";
import type { SiteContentField, SiteContentSection } from "@/data/siteContentSchema";
import { Card } from "./Card";

const initialState: SiteContentFormState = {};

function FieldInput({ id, field, defaultValue }: { id: string; field: SiteContentField; defaultValue: string }) {
  const control =
    "mt-1.5 w-full rounded-[var(--radius-control)] border border-line-strong bg-panel px-3.5 text-paper outline-none transition-colors placeholder:text-mist/60 focus:border-mint/60";

  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium text-paper">
        {field.label}
      </label>
      {field.kind === "textarea" ? (
        <textarea
          id={id}
          name={field.key}
          defaultValue={defaultValue}
          maxLength={field.maxLength}
          rows={3}
          className={`${control} resize-y py-2.5`}
        />
      ) : (
        <input id={id} name={field.key} defaultValue={defaultValue} maxLength={field.maxLength} className={`${control} h-11`} />
      )}
      {field.sensitive ? (
        <p className="mt-1.5 flex items-start gap-1.5 text-xs text-loss">
          <Icon name="alert" size={14} className="mt-0.5 shrink-0" />
          {siteContentPage.sensitiveWarning}
        </p>
      ) : null}
    </div>
  );
}

/**
 * Un modulo per sezione della homepage. I campi arrivano dallo schema
 * (src/data/siteContentSchema.ts): aggiungere un campo lì basta a farlo
 * comparire qui, senza scrivere un nuovo modulo per ogni sezione.
 */
export function SiteContentSectionForm({
  section,
  savedValues,
}: {
  section: SiteContentSection;
  savedValues: Record<string, string>;
}) {
  const [state, formAction, pending] = useActionState(saveSiteContentAction, initialState);

  return (
    <Card title={section.label}>
      {section.description ? <p className="mb-4 text-sm text-mist">{section.description}</p> : null}
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="section_key" value={section.key} />

        {section.fields.map((field) => (
          <FieldInput
            key={field.key}
            id={`${section.key}-${field.key}`}
            field={field}
            defaultValue={savedValues[field.key] ?? section.defaults[field.key] ?? ""}
          />
        ))}

        {state.error ? (
          <p role="alert" className="text-sm text-loss">
            {state.error}
          </p>
        ) : null}
        {state.success ? (
          <p role="status" className="text-sm text-mint">
            {state.success}
          </p>
        ) : null}

        <Button type="submit" variant="secondary" size="sm" disabled={pending}>
          {pending ? siteContentPage.saving : siteContentPage.save}
        </Button>
      </form>
    </Card>
  );
}
