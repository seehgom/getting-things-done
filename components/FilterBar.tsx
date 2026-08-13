import Link from "next/link";

function buildHref(
  basePath: string,
  current: { category?: string; context?: string },
  override: { category?: string } | { context?: string }
) {
  const merged = { ...current, ...override };
  const qs = new URLSearchParams();
  if (merged.category) qs.set("category", merged.category);
  if (merged.context) qs.set("context", merged.context);
  const s = qs.toString();
  return s ? `${basePath}?${s}` : basePath;
}

function pillClass(active: boolean) {
  return `rounded-full border px-2.5 py-1 text-xs transition-colors ${
    active
      ? "border-accent bg-accent text-accent-foreground"
      : "border-card-border text-muted hover:bg-card-border/40"
  }`;
}

export default function FilterBar({
  basePath,
  categories,
  contexts,
  selectedCategory,
  selectedContext,
}: {
  basePath: string;
  categories: string[];
  contexts: string[];
  selectedCategory?: string;
  selectedContext?: string;
}) {
  if (categories.length === 0 && contexts.length === 0) return null;

  const current = { category: selectedCategory, context: selectedContext };
  const hasFilter = Boolean(selectedCategory || selectedContext);

  return (
    <div className="flex flex-col gap-2.5 rounded-xl border border-card-border bg-card px-4 py-3 shadow-sm">
      {categories.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="w-16 shrink-0 text-xs font-medium text-muted">
            Category
          </span>
          <Link
            href={buildHref(basePath, current, { category: undefined })}
            className={pillClass(!selectedCategory)}
          >
            All
          </Link>
          {categories.map((c) => (
            <Link
              key={c}
              href={buildHref(basePath, current, { category: c })}
              className={pillClass(selectedCategory === c)}
            >
              {c}
            </Link>
          ))}
        </div>
      )}

      {contexts.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="w-16 shrink-0 text-xs font-medium text-muted">
            Context
          </span>
          <Link
            href={buildHref(basePath, current, { context: undefined })}
            className={pillClass(!selectedContext)}
          >
            All
          </Link>
          {contexts.map((c) => (
            <Link
              key={c}
              href={buildHref(basePath, current, { context: c })}
              className={pillClass(selectedContext === c)}
            >
              @{c}
            </Link>
          ))}
        </div>
      )}

      {hasFilter && (
        <Link
          href={basePath}
          className="self-start text-xs text-muted underline hover:text-foreground"
        >
          Clear filters
        </Link>
      )}
    </div>
  );
}
