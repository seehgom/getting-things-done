"use client";

import { useState, useTransition } from "react";
import {
  deleteVoiceNote,
  setVoiceNoteStatus,
  updateVoiceNoteAction,
} from "@/app/voiceNoteActions";
import { CATEGORY_SUGGESTIONS } from "@/lib/gtd";
import type { VoiceNote } from "@/lib/voiceNotes";

const ARTIFACT_TYPE_SUGGESTIONS = ["doc", "pdf", "sheet", "slides", "link", "image"];

function artifactIcon(type: string | null) {
  switch ((type || "").toLowerCase()) {
    case "doc":
      return "📄";
    case "pdf":
      return "📕";
    case "sheet":
      return "📊";
    case "slides":
      return "📽️";
    case "image":
      return "🖼️";
    default:
      return "🔗";
  }
}

export default function VoiceNoteItem({ note }: { note: VoiceNote }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const done = (note.status || "").toLowerCase() === "done";

  function handleDelete() {
    if (!confirm(`Delete "${note.description}"?`)) return;
    startTransition(() => deleteVoiceNote(note.id));
  }

  function handleSave(formData: FormData) {
    startTransition(async () => {
      await updateVoiceNoteAction(formData);
      setOpen(false);
    });
  }

  return (
    <li className="rounded-lg border border-card-border bg-card px-3 py-2.5 text-sm shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span aria-hidden>{artifactIcon(note.artifact_type)}</span>
            <span className="font-medium">{note.description}</span>
            {note.category && (
              <span className="rounded-full border border-card-border px-2 py-0.5 text-[11px] text-muted">
                {note.category}
              </span>
            )}
            {note.project && (
              <span className="rounded-full bg-card-border/40 px-2 py-0.5 text-[11px] text-muted">
                {note.project}
              </span>
            )}
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] ${
                done ? "bg-accent/15 text-accent" : "bg-warning-bg text-warning"
              }`}
            >
              {note.status || "Open"}
            </span>
            <span className="ml-auto shrink-0 text-[11px] text-muted">
              {new Date(note.created_at).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
          {note.notes && <p className="mt-1 text-xs text-muted">{note.notes}</p>}
        </div>
      </div>

      {!open && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {note.drive_link && (
            <a
              href={note.drive_link}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md border border-card-border px-2 py-1 text-xs hover:bg-accent hover:text-accent-foreground"
            >
              Open link ↗
            </a>
          )}
          <button
            type="button"
            onClick={() =>
              startTransition(() => setVoiceNoteStatus(note.id, done ? "Open" : "Done"))
            }
            disabled={isPending}
            className="rounded-md border border-card-border px-2 py-1 text-xs hover:bg-card-border/40"
          >
            {done ? "Reopen" : "✓ Done"}
          </button>
          <button
            type="button"
            onClick={() => setOpen(true)}
            disabled={isPending}
            className="rounded-md px-2 py-1 text-xs text-muted hover:bg-card-border/40"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="rounded-md px-2 py-1 text-xs text-danger hover:bg-danger-bg"
          >
            Delete
          </button>
        </div>
      )}

      {open && (
        <form
          action={handleSave}
          className="mt-3 grid grid-cols-2 gap-2 border-t border-card-border pt-3 sm:grid-cols-4"
        >
          <input type="hidden" name="id" value={note.id} />
          <label className="col-span-2 flex flex-col gap-1 sm:col-span-4">
            <span className="text-[11px] text-muted">Description</span>
            <input
              name="description"
              defaultValue={note.description}
              required
              className="rounded-md border border-card-border bg-background px-2 py-1.5 text-sm outline-none focus:border-accent"
            />
          </label>
          <label className="col-span-2 flex flex-col gap-1 sm:col-span-4">
            <span className="text-[11px] text-muted">Link</span>
            <input
              name="drive_link"
              type="url"
              defaultValue={note.drive_link ?? ""}
              placeholder="https://drive.google.com/…"
              className="rounded-md border border-card-border bg-background px-2 py-1.5 text-sm outline-none focus:border-accent"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[11px] text-muted">Type</span>
            <input
              name="artifact_type"
              defaultValue={note.artifact_type ?? ""}
              list="known-artifact-types"
              className="rounded-md border border-card-border bg-background px-2 py-1.5 text-sm outline-none focus:border-accent"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[11px] text-muted">Category</span>
            <input
              name="category"
              defaultValue={note.category ?? ""}
              list="known-voice-categories"
              className="rounded-md border border-card-border bg-background px-2 py-1.5 text-sm outline-none focus:border-accent"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[11px] text-muted">Project</span>
            <input
              name="project"
              defaultValue={note.project ?? ""}
              className="rounded-md border border-card-border bg-background px-2 py-1.5 text-sm outline-none focus:border-accent"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[11px] text-muted">Status</span>
            <select
              name="status"
              defaultValue={note.status ?? "Open"}
              className="rounded-md border border-card-border bg-background px-2 py-1.5 text-sm outline-none focus:border-accent"
            >
              <option value="Open">Open</option>
              <option value="Done">Done</option>
            </select>
          </label>
          <label className="col-span-2 flex flex-col gap-1 sm:col-span-4">
            <span className="text-[11px] text-muted">Notes</span>
            <textarea
              name="notes"
              defaultValue={note.notes ?? ""}
              rows={2}
              className="rounded-md border border-card-border bg-background px-2 py-1.5 text-sm outline-none focus:border-accent"
            />
          </label>
          <div className="col-span-2 flex gap-2 sm:col-span-4">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-accent-foreground hover:opacity-90 disabled:opacity-50"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md border border-card-border px-3 py-1.5 text-xs hover:bg-card-border/40"
            >
              Cancel
            </button>
          </div>
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
        </form>
      )}
    </li>
  );
}
