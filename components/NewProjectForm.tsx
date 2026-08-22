"use client";

import { useRef, useState, useTransition } from "react";
import { createProject } from "@/app/actions";

export default function NewProjectForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        await createProject(formData);
        formRef.current?.reset();
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
          name="name"
          required
          placeholder="New project name…"
          autoComplete="off"
          className="flex-1 rounded-lg border border-card-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
        />
        <input
          name="notes"
          placeholder="Notes (optional)"
          className="flex-1 rounded-lg border border-card-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
        />
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? "Adding…" : "Add project"}
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-danger">{error}</p>}
    </form>
  );
}
