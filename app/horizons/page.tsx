import Link from "next/link";
import AddHorizonEntry from "@/components/AddHorizonEntry";
import HorizonItem from "@/components/HorizonItem";
import Section from "@/components/Section";
import { HORIZON_LEVELS, getHorizons } from "@/lib/horizons";
import { classify } from "@/lib/gtd";
import { getTasks } from "@/lib/tasks";

export default async function HorizonsPage() {
  const [horizons, tasks] = await Promise.all([getHorizons(), getTasks()]);
  const nextActionCount = tasks.filter((t) => classify(t) === "next").length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Horizons of Focus
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Allen&apos;s altitude model, from the ground up: next actions serve
          projects, projects serve your areas of responsibility, which serve
          your goals, your vision, and ultimately your purpose. Stabilize the
          ground level first — clarity about the higher altitudes tends to
          follow once the daily noise is under control.
        </p>
      </div>

      {HORIZON_LEVELS.map(({ level, altitude, name, description }) => {
        const entries = horizons.filter((h) => h.level === level);
        const active = entries.filter((h) => h.status !== "Archived");
        return (
          <Section
            key={level}
            icon="🪂"
            title={`${altitude} — ${name}`}
            description={description}
            count={active.length}
          >
            <AddHorizonEntry level={level} />
            {entries.length > 0 && (
              <ul className="space-y-2">
                {entries.map((h) => (
                  <HorizonItem key={h.id} horizon={h} />
                ))}
              </ul>
            )}
          </Section>
        );
      })}

      <Section icon="🧭" title="Ground — Next Actions" count={nextActionCount}>
        <p className="rounded-lg border border-dashed border-card-border px-3 py-4 text-center text-xs text-muted">
          Ground level lives on the{" "}
          <Link href="/" className="text-accent hover:underline">
            dashboard
          </Link>{" "}
          — it&apos;s every clarified next action, not tracked separately
          here.
        </p>
      </Section>
    </div>
  );
}
