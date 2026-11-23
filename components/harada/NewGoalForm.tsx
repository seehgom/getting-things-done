"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createGoal } from "@/app/harada/actions";

export default function NewGoalForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        const id = await createGoal(formData);
        formRef.current?.reset();
        router.push(`/harada/${id}`);
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
          name="title"
          required
          placeholder="What's the goal?"
          autoComplete="off"
          className="flex-1 rounded-lg border border-card-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
        />
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? "Creating…" : "Create matrix"}
        </button>
      </div>

      <button
        type="button"
        onClick={() => setShowDetails((v) => !v)}
        className="mt-2 text-xs text-muted hover:text-foreground"
      >
        {showDetails ? "− Hide details" : "+ Add why it matters, target date"}
      </button>

      {showDetails && (
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <input
            name="why"
            placeholder="Why does this goal matter?"
            className="rounded-lg border border-card-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
          />
          <input
            name="target_date"
            type="date"
            className="rounded-lg border border-card-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </div>
      )}

      {error && <p className="mt-2 text-xs text-danger">{error}</p>}

      <p className="mt-2 text-xs text-muted">
        Creates the full 8×8 grid empty and ready to fill in — nothing to
        configure up front.
      </p>
    </form>
  );
}
