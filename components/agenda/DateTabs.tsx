import Link from "next/link";

/** Today/Tomorrow tabs shared by all three agenda layouts — plain links
 * so the date lives in the URL (?when=) and each page stays a Server
 * Component that re-fetches for the selected day. */
export default function DateTabs({
  basePath,
  when,
}: {
  basePath: string;
  when: "today" | "tomorrow";
}) {
  return (
    <div className="flex gap-2 text-sm">
      <Link
        href={basePath}
        className={`rounded-full px-3 py-1.5 font-medium transition-colors ${
          when === "today"
            ? "bg-accent text-accent-foreground"
            : "border border-card-border text-muted hover:bg-card-border/40"
        }`}
      >
        Today
      </Link>
      <Link
        href={`${basePath}?when=tomorrow`}
        className={`rounded-full px-3 py-1.5 font-medium transition-colors ${
          when === "tomorrow"
            ? "bg-accent text-accent-foreground"
            : "border border-card-border text-muted hover:bg-card-border/40"
        }`}
      >
        Tomorrow
      </Link>
    </div>
  );
}
