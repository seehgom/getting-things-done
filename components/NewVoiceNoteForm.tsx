"use client";

import { useRef, useState, useTransition } from "react";
import { createVoiceNote } from "@/app/voiceNoteActions";
import { CATEGORY_SUGGESTIONS } from "@/lib/gtd";

const ARTIFACT_TYPE_SUGGESTIONS = ["doc", "pdf", "sheet", "slides", "link", "image"];

export default function NewVoiceNoteForm() {
  const [isPending, startTransition] = useTransition();
  const [showDetails, setShowDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        await createVoiceNote(formData);
        formRef.current?.reset();
        setShowDetails(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong");
      }
    });
  }

  return (
    <form
      ref={formRef}
      action={handleSubmit}
      className="rounded-xl border border-card-border bg-card p-4 shadow-sm"
    >
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          name="description"
          required
          placeholder="What did it produce? (e.g. Home security options doc)"
          autoComplete="off"
          className="flex-1 rounded-lg border border-card-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
        />
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? "Adding…" : "Add entry"}
        </button>
      </div>

      <button
        type="button"
        onClick={() => setShowDetails((v) => !v)}
        className="mt-2 text-xs text-muted hover:text-foreground"
      >
        {showDetails ? "− Hide details" : "+ Add link, type, category, notes"}
      </button>

      {showDetails && (
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
          <input
            name="drive_link"
            type="url"
            placeholder="Link (Drive, product, …)"
            className="rounded-lg border border-card-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
          />
          <input
            name="artifact_type"
            list="known-artifact-types"
            placeholder="Type (doc, pdf, link…)"
            className="rounded-lg border border-card-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
          />
          <input
            name="category"
            list="known-voice-categories"
            placeholder="Category (e.g. Home)"
            className="rounded-lg border border-card-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
          />
          <input
            name="project"
            placeholder="Project (optional)"
            className="rounded-lg border border-card-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
          />
          <input
            name="notes"
            placeholder="Notes"
            className="rounded-lg border border-card-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </div>
      )}

      <datalist id="known-artifact-types">
        {ARTIFACT_TYPE_SUGGESTIONS.map((t) => (
          <option key={t} value={t} />
        ))}
      </datalist>
      <datalist id="known-voice-categories">
        {CATEGORY_SUGGESTIONS.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>

      {error && <p className="mt-2 text-xs text-danger">{error}</p>}

      <p className="mt-2 text-xs text-muted">
        Claude&apos;s voice chat adds these automatically when it generates
        something it can&apos;t hand back as speech — a document, a
        product search, a link. This form is just for adding one by hand.
      </p>
    </form>
  );
}
