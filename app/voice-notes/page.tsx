import Section from "@/components/Section";
import NewVoiceNoteForm from "@/components/NewVoiceNoteForm";
import VoiceNoteItem from "@/components/VoiceNoteItem";
import { getVoiceNotes } from "@/lib/voiceNotes";

export default async function VoiceNotesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const [notes, sp] = await Promise.all([getVoiceNotes(), searchParams]);
  const selectedCategory = sp.category?.trim() || undefined;

  const categories = Array.from(
    new Set(notes.map((n) => n.category?.trim()).filter(Boolean))
  ).sort();

  const filtered = selectedCategory
    ? notes.filter((n) => n.category === selectedCategory)
    : notes;

  const open = filtered.filter((n) => (n.status || "").toLowerCase() !== "done");
  const done = filtered.filter((n) => (n.status || "").toLowerCase() === "done");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Voice Notes</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          An index of everything Claude&apos;s voice chat has produced on
          your behalf — a generated doc or PDF uploaded to Drive, a product
          search&apos;s results, a link it found — anything voice
          can&apos;t hand back as speech lands here instead, with a
          description and a link to open it.
        </p>
      </div>

      {categories.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <a
            href="/voice-notes"
            className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${
              !selectedCategory
                ? "border-accent bg-accent text-accent-foreground"
                : "border-card-border text-muted hover:bg-card-border/40"
            }`}
          >
            All
          </a>
          {categories.map((c) => (
            <a
              key={c}
              href={`/voice-notes?category=${encodeURIComponent(c as string)}`}
              className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${
                c === selectedCategory
                  ? "border-accent bg-accent text-accent-foreground"
                  : "border-card-border text-muted hover:bg-card-border/40"
              }`}
            >
              {c}
            </a>
          ))}
        </div>
      )}

      <NewVoiceNoteForm />

      <Section
        icon="🎙️"
        title="Open"
        description="Not yet reviewed or acted on."
        count={open.length}
      >
        {open.length === 0 ? (
          <p className="rounded-lg border border-dashed border-card-border px-3 py-4 text-center text-xs text-muted">
            Nothing here yet — ask Claude&apos;s voice chat to generate or
            find something and it&apos;ll show up here.
          </p>
        ) : (
          <ul className="space-y-2">
            {open.map((n) => (
              <VoiceNoteItem key={n.id} note={n} />
            ))}
          </ul>
        )}
      </Section>

      <Section
        icon="✅"
        title="Done"
        description="Reviewed and handled."
        count={done.length}
        defaultOpen={false}
      >
        {done.length === 0 ? (
          <p className="rounded-lg border border-dashed border-card-border px-3 py-4 text-center text-xs text-muted">
            Nothing marked done yet.
          </p>
        ) : (
          <ul className="space-y-2">
            {done.map((n) => (
              <VoiceNoteItem key={n.id} note={n} />
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}
