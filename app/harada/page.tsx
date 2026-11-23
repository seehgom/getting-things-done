import { getHaradaGoals, getHaradaMatrix, countFilledItems } from "@/lib/harada";
import NewGoalForm from "@/components/harada/NewGoalForm";
import GoalCard from "@/components/harada/GoalCard";

export default async function HaradaGoalsPage() {
  const goals = await getHaradaGoals();
  const progress = await Promise.all(
    goals.map(async (g) => ({
      id: g.id,
      ...countFilledItems(await getHaradaMatrix(g.id)),
    }))
  );
  const progressById = new Map(progress.map((p) => [p.id, p]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Harada Method — Goal Matrix
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Takashi Harada&apos;s &ldquo;Open Window 64&rdquo; — the same goal
          achievement matrix Shohei Ohtani used. One main goal, broken into 8
          key elements, each broken into 8 specific action items. Create one
          per goal; drill into an item and promote it straight to a real task
          once you&apos;re ready to act on it.
        </p>
      </div>

      <NewGoalForm />

      {goals.length === 0 ? (
        <p className="rounded-lg border border-dashed border-card-border px-3 py-6 text-center text-sm text-muted">
          No goals yet — add one above to lay out its matrix.
        </p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              progress={progressById.get(goal.id) ?? { filled: 0, total: 64 }}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
