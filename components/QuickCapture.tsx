"use client";

import { useRef, useState, useTransition } from "react";
import { createTask } from "@/app/actions";
import { OFFENSE_DEFENSE_OPTIONS } from "@/lib/gtd";

export default function QuickCapture({
  categories,
  contexts,
}: {
  categories: string[];
  contexts: string[];
}) {
  const [isPending, startTransition] = useTransition();
  const [showDetails, setShowDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        await createTask(formData);
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
          name="task"
          required
          placeholder="Capture anything on your mind…"
          autoComplete="off"
          className="flex-1 rounded-lg border border-card-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
        />
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? "Adding…" : "Capture"}
        </button>
      </div>

      <button
        type="button"
        onClick={() => setShowDetails((v) => !v)}
        className="mt-2 text-xs text-muted hover:text-foreground"
      >
        {showDetails
          ? "− Hide details"
          : "+ Add category, offense/defense, due date, notes"}
      </button>

      {showDetails && (
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
          <input
            name="category"
            list="known-categories"
            placeholder="Category (e.g. Work)"
            className="rounded-lg border border-card-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
          />
          <input
            name="context"
            list="known-contexts"
            placeholder="Context (e.g. Desk)"
            className="rounded-lg border border-card-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
          />
          <select
            name="offense_defense"
            defaultValue=""
            className="rounded-lg border border-card-border bg-background px-3 py-2 text-sm text-muted outline-none focus:border-accent"
          >
            <option value="">Offense / Defense</option>
            {OFFENSE_DEFENSE_OPTIONS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
          <input
            name="due_date"
            type="date"
            className="rounded-lg border border-card-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
          />
          <input
            name="notes"
            placeholder="Notes"
            className="rounded-lg border border-card-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
          />
          <label className="flex items-center gap-2 px-1 text-xs text-muted">
            <input type="checkbox" name="is_project" className="h-3.5 w-3.5" />
            This is a project (add its actions afterward)
          </label>
        </div>
      )}

      <datalist id="known-categories">
        {categories.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>
      <datalist id="known-contexts">
        {contexts.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>

      {error && <p className="mt-2 text-xs text-danger">{error}</p>}

      <p className="mt-2 text-xs text-muted">
        Just capture it — you don&apos;t need urgency, importance, or a
        category yet. Leave those blank and it lands in your Inbox to
        clarify later, just like David Allen&apos;s five-step workflow.
      </p>
    </form>
  );
}
