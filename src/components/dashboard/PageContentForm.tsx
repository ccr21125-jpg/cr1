"use client";

import { useActionState, useState } from "react";
import { savePageContentAction, type PageContentFormState } from "@/app/dashboard/admin/pagine/actions";
import { Button } from "@/components/ui/Button";
import { pagesAdminContent } from "@/data/content";
import type { PageBlock } from "@/data/pageContentSchema";
import { Card } from "./Card";

const initialState: PageContentFormState = {};

/** Blocco in modifica: l'id serve solo da chiave React, non viene salvato. */
type EditableBlock = PageBlock & { id: number };

let nextId = 0;
function withId(block: PageBlock): EditableBlock {
  nextId += 1;
  return { ...block, id: nextId };
}

const controlClass =
  "mt-1.5 w-full rounded-[var(--radius-control)] border border-line-strong bg-panel px-3.5 text-paper outline-none transition-colors placeholder:text-mist/60 focus:border-mint/60";

function ReorderButtons({
  index,
  count,
  onMove,
  onRemove,
}: {
  index: number;
  count: number;
  onMove: (dir: -1 | 1) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex shrink-0 items-center gap-1">
      <button
        type="button"
        onClick={() => onMove(-1)}
        disabled={index === 0}
        aria-label={pagesAdminContent.moveUp}
        className="grid size-7 place-items-center rounded-lg text-mist transition-colors hover:bg-panel hover:text-paper disabled:pointer-events-none disabled:opacity-30"
      >
        ↑
      </button>
      <button
        type="button"
        onClick={() => onMove(1)}
        disabled={index === count - 1}
        aria-label={pagesAdminContent.moveDown}
        className="grid size-7 place-items-center rounded-lg text-mist transition-colors hover:bg-panel hover:text-paper disabled:pointer-events-none disabled:opacity-30"
      >
        ↓
      </button>
      <button
        type="button"
        onClick={onRemove}
        aria-label={pagesAdminContent.remove}
        className="grid size-7 place-items-center rounded-lg text-mist transition-colors hover:bg-panel hover:text-loss"
      >
        ✕
      </button>
    </div>
  );
}

/**
 * Editor a blocchi per una pagina del footer: testo e immagini, nell'ordine
 * scelto dall'amministratore. Lo stato vive qui (aggiungere/rimuovere/
 * riordinare prima di inviare non passa dal server); l'invio serializza
 * l'intero elenco in un campo nascosto, e la Server Action lo rivalida da
 * capo prima di salvarlo — un campo nascosto non è mai un dato fidato.
 */
export function PageContentForm({
  slug,
  label,
  initialBlocks,
}: {
  slug: string;
  label: string;
  initialBlocks: PageBlock[];
}) {
  const [state, formAction, pending] = useActionState(savePageContentAction, initialState);
  const [blocks, setBlocks] = useState<EditableBlock[]>(() => initialBlocks.map(withId));

  function addText() {
    setBlocks((b) => [...b, withId({ type: "text", text: "" })]);
  }
  function addImage() {
    setBlocks((b) => [...b, withId({ type: "image", url: "", alt: "" })]);
  }
  function remove(index: number) {
    setBlocks((b) => b.filter((_, i) => i !== index));
  }
  function move(index: number, dir: -1 | 1) {
    setBlocks((b) => {
      const target = index + dir;
      if (target < 0 || target >= b.length) return b;
      const copy = [...b];
      [copy[index], copy[target]] = [copy[target]!, copy[index]!];
      return copy;
    });
  }
  function updateText(index: number, text: string) {
    setBlocks((b) => b.map((block, i) => (i === index && block.type === "text" ? { ...block, text } : block)));
  }
  function updateImage(index: number, field: "url" | "alt", value: string) {
    setBlocks((b) =>
      b.map((block, i) => (i === index && block.type === "image" ? { ...block, [field]: value } : block)),
    );
  }

  const serialized = JSON.stringify(
    blocks.map((block): PageBlock =>
      block.type === "text" ? { type: "text", text: block.text } : { type: "image", url: block.url, alt: block.alt },
    ),
  );

  return (
    <Card title={label}>
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="slug" value={slug} />
        <input type="hidden" name="blocks" value={serialized} />

        {blocks.length === 0 ? (
          <p className="text-sm text-mist">{pagesAdminContent.empty}</p>
        ) : (
          <ul className="space-y-3">
            {blocks.map((block, index) => (
              <li key={block.id} className="rounded-[var(--radius-card)] border border-line bg-panel-raised p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium uppercase tracking-[0.08em] text-mist">
                    {block.type === "text" ? pagesAdminContent.textBlock : pagesAdminContent.imageBlock}
                  </span>
                  <ReorderButtons
                    index={index}
                    count={blocks.length}
                    onMove={(dir) => move(index, dir)}
                    onRemove={() => remove(index)}
                  />
                </div>

                {block.type === "text" ? (
                  <textarea
                    value={block.text}
                    onChange={(e) => updateText(index, e.target.value)}
                    rows={4}
                    maxLength={5000}
                    placeholder={pagesAdminContent.textPlaceholder}
                    className={`${controlClass} resize-y py-2.5`}
                  />
                ) : (
                  <div className="space-y-2">
                    <div>
                      <label className="text-xs text-mist">{pagesAdminContent.imageUrlLabel}</label>
                      <input
                        value={block.url}
                        onChange={(e) => updateImage(index, "url", e.target.value)}
                        placeholder={pagesAdminContent.imageUrlPlaceholder}
                        maxLength={2000}
                        autoComplete="off"
                        spellCheck={false}
                        className={`${controlClass} h-10`}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-mist">{pagesAdminContent.imageAltLabel}</label>
                      <input
                        value={block.alt}
                        onChange={(e) => updateImage(index, "alt", e.target.value)}
                        placeholder={pagesAdminContent.imageAltPlaceholder}
                        maxLength={200}
                        className={`${controlClass} h-10`}
                      />
                    </div>
                    {block.url ? (
                      // Anteprima di un URL scelto dall'amministratore, non un asset del sito.
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={block.url}
                        alt=""
                        className="mt-1 max-h-40 rounded-[var(--radius-card)] border border-line object-cover"
                      />
                    ) : null}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={addText}>
            {pagesAdminContent.addText}
          </Button>
          <Button type="button" variant="secondary" size="sm" onClick={addImage}>
            {pagesAdminContent.addImage}
          </Button>
        </div>

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

        <Button type="submit" size="sm" disabled={pending}>
          {pending ? pagesAdminContent.saving : pagesAdminContent.save}
        </Button>
      </form>
    </Card>
  );
}
