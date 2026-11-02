"use client";

import { useState, useTransition } from "react";
import { setTopicStatus } from "@/app/databricks/actions";
import type { SectionView, StudyRow } from "@/lib/studyTree";

function resourceChipLabel(r: StudyRow): string {
  const url = r.url ?? "";
  if (url.includes("pluralsight.com")) return "Pluralsight search";
  if (url.includes("youtube.com")) return "YouTube search";
  if (r.resource_type === "course") return "Free course";
  if (r.resource_type) return r.resource_type[0].toUpperCase() + r.resource_type.slice(1);
  return "Resource";
}

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--db-accent)]";

export default function StudyApp({
  examTitle,
  examMeta,
  sections,
  totalTopics,
  doneTopics,
}: {
  examTitle: string;
  examMeta: string | null;
  sections: SectionView[];
  totalTopics: number;
  doneTopics: number;
}) {
  const [expanded, setExpanded] = useState<Record<number, boolean>>(() =>
    Object.fromEntries(sections.map((s) => [s.id, true]))
  );
  const maxWeight = Math.max(0, ...sections.map((s) => s.weightPct));
  const overallPct = totalTopics === 0 ? 0 : Math.round((doneTopics / totalTopics) * 100);

  function toggle(id: number) {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function expandAll() {
    setExpanded(Object.fromEntries(sections.map((s) => [s.id, true])));
  }

  function collapseAll() {
    setExpanded(Object.fromEntries(sections.map((s) => [s.id, false])));
  }

  return (
    <div className="mx-auto max-w-[760px] space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">{examTitle}</h1>
        {examMeta && <p className="text-sm text-[var(--db-muted)]">{examMeta}</p>}
        <div className="space-y-1">
          <div className="h-2.5 overflow-hidden rounded-full bg-[var(--db-accent-soft)]">
            <div
              className="h-full rounded-full bg-[var(--db-accent)] transition-[width]"
              style={{ width: `${overallPct}%` }}
            />
          </div>
          <p className="text-xs text-[var(--db-muted)]">
            {doneTopics} of {totalTopics} topics done
          </p>
        </div>
      </header>

      <a
        href="https://www.databricks.com/learn/training/login"
        target="_blank"
        rel="noopener noreferrer"
        className={`flex items-center justify-between rounded-xl border border-[var(--db-line)] bg-[var(--db-surface)] px-4 py-3 text-sm shadow-sm hover:border-[var(--db-accent)] ${FOCUS_RING}`}
      >
        <span>
          <span aria-hidden>🚀</span> Start here — Databricks Academy, search{" "}
          <span className="font-medium">&ldquo;Generative AI Pathway&rdquo;</span>
        </span>
        <span aria-hidden className="shrink-0 text-[var(--db-muted)]">
          ↗
        </span>
      </a>

      <div className="flex overflow-hidden rounded-xl border border-[var(--db-line)]">
        {sections.map((s) => {
          const fillPct = s.totalCount === 0 ? 0 : Math.round((s.doneCount / s.totalCount) * 100);
          const highlighted = s.weightPct === maxWeight;
          return (
            <a
              key={s.id}
              href={`#section-${s.id}`}
              title={s.title}
              aria-label={`${s.title}, ${s.weightPct}% of exam, ${s.doneCount} of ${s.totalCount} topics done`}
              style={{ width: `${s.weightPct}%` }}
              className={`relative flex flex-col items-center justify-center gap-1 border-r border-[var(--db-line)] bg-[var(--db-surface)] px-1 py-3 text-center last:border-r-0 hover:bg-[var(--db-accent-soft)] ${FOCUS_RING} ${
                highlighted ? "ring-1 ring-inset ring-[var(--db-accent)]" : ""
              }`}
            >
              <span className="font-mono text-xs font-semibold">{s.weightPct}%</span>
              <span className="absolute inset-x-0 bottom-0 h-1.5 bg-[var(--db-accent-soft)]">
                <span
                  className="block h-full bg-[var(--db-done)]"
                  style={{ width: `${fillPct}%` }}
                />
              </span>
            </a>
          );
        })}
      </div>

      <div className="flex justify-end gap-2 text-xs">
        <button
          type="button"
          onClick={expandAll}
          className={`rounded-md border border-[var(--db-line)] px-2 py-1 hover:bg-[var(--db-accent-soft)] ${FOCUS_RING}`}
        >
          Expand all
        </button>
        <button
          type="button"
          onClick={collapseAll}
          className={`rounded-md border border-[var(--db-line)] px-2 py-1 hover:bg-[var(--db-accent-soft)] ${FOCUS_RING}`}
        >
          Collapse all
        </button>
      </div>

      <div className="space-y-3 pb-12">
        {sections.map((s, i) => (
          <SectionBlock
            key={s.id}
            index={i + 1}
            section={s}
            open={expanded[s.id] ?? true}
            onToggle={() => toggle(s.id)}
          />
        ))}
      </div>
    </div>
  );
}

function SectionBlock({
  index,
  section,
  open,
  onToggle,
}: {
  index: number;
  section: SectionView;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <section
      id={`section-${section.id}`}
      className="scroll-mt-20 rounded-xl border border-[var(--db-line)] bg-[var(--db-surface)] shadow-sm"
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className={`flex w-full items-center justify-between gap-3 rounded-xl px-4 py-3 text-left ${FOCUS_RING}`}
      >
        <span className="flex min-w-0 items-center gap-2">
          <span className="font-mono text-xs text-[var(--db-muted)]">{index}</span>
          <span className="truncate font-medium">{section.title}</span>
          <span className="shrink-0 rounded-full bg-[var(--db-accent-soft)] px-2 py-0.5 text-[11px] font-mono text-[var(--db-accent)]">
            {section.weightPct}%
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-2 text-xs text-[var(--db-muted)]">
          <span className="font-mono">
            {section.doneCount}/{section.totalCount}
          </span>
          <span aria-hidden className={`transition-transform ${open ? "rotate-180" : ""}`}>
            ▾
          </span>
        </span>
      </button>

      {open && (
        <div className="space-y-3 border-t border-[var(--db-line)] px-4 py-3">
          <ul className="space-y-2">
            {section.topics.map((t) => (
              <TopicRow key={t.id} topic={t} />
            ))}
          </ul>

          {section.resources.length > 0 && (
            <div className="space-y-1.5 border-t border-[var(--db-line)] pt-3">
              <p className="text-xs font-medium text-[var(--db-muted)]">Where to learn it</p>
              <ul className="flex flex-wrap gap-1.5">
                {section.resources.map((r) => (
                  <li key={r.id}>
                    <a
                      href={r.url ?? "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={r.notes ?? undefined}
                      className={`inline-flex items-center gap-1 rounded-full border border-[var(--db-line)] bg-[var(--db-accent-soft)] px-2.5 py-1 text-[11px] text-[var(--db-accent)] hover:opacity-80 ${FOCUS_RING}`}
                    >
                      {resourceChipLabel(r)}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function TopicRow({ topic }: { topic: StudyRow }) {
  const [isPending, startTransition] = useTransition();
  const done = topic.status === "done";

  return (
    <li className="flex items-start gap-2.5">
      <input
        type="checkbox"
        id={`topic-${topic.id}`}
        checked={done}
        disabled={isPending}
        onChange={(e) => {
          const checked = e.target.checked;
          startTransition(() => setTopicStatus(topic.id, checked));
        }}
        className={`mt-0.5 h-4 w-4 shrink-0 accent-[var(--db-accent)] ${FOCUS_RING}`}
      />
      <label
        htmlFor={`topic-${topic.id}`}
        className={`text-sm ${done ? "text-[var(--db-muted)] line-through" : ""}`}
      >
        {topic.title}
      </label>
    </li>
  );
}
