export default function Section({
  icon,
  title,
  description,
  count,
  children,
  defaultOpen = true,
}: {
  icon: string;
  title: string;
  description?: string;
  count?: number;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details open={defaultOpen} className="group">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 rounded-lg py-2 select-none">
        <div className="flex items-center gap-2">
          <span aria-hidden>{icon}</span>
          <h2 className="text-base font-semibold">{title}</h2>
          {typeof count === "number" && (
            <span className="rounded-full bg-card-border/60 px-2 py-0.5 text-xs text-muted">
              {count}
            </span>
          )}
        </div>
        <span className="text-xs text-muted transition-transform group-open:rotate-180">
          ▾
        </span>
      </summary>
      {description && (
        <p className="mb-2 -mt-1 text-xs text-muted">{description}</p>
      )}
      <div className="space-y-2">{children}</div>
    </details>
  );
}
