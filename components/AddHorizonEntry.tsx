"use client";

import { useRef, useState, useTransition } from "react";
import { createHorizon } from "@/app/horizons/actions";
import type { HorizonLevel } from "@/lib/horizons";

export default function AddHorizonEntry({ level }: { level: HorizonLevel }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        await createHorizon(formData);
        formRef.current?.reset();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong");
      }
    });
  }

  return (
    <form ref={formRef} action={handleSubmit}>
      <input type="hidden" name="level" value={level} />
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          name="title"
          required
          placeholder="Add an entry at this altitude…"
          autoComplete="off"
          className="flex-1 rounded-lg border border-card-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
        />
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? "Adding…" : "Add"}
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-danger">{error}</p>}
    </form>
  );
}
