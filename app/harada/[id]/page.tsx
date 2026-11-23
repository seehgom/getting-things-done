import { notFound } from "next/navigation";
import Link from "next/link";
import { getHaradaGoal, getHaradaMatrix } from "@/lib/harada";
import HaradaMatrix from "@/components/harada/HaradaMatrix";
import GoalHeader from "@/components/harada/GoalHeader";

export default async function HaradaGoalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [goal, elements] = await Promise.all([getHaradaGoal(id), getHaradaMatrix(id)]);

  if (!goal) notFound();

  return (
    <div className="space-y-6">
      <Link href="/harada" className="text-xs text-muted hover:text-foreground">
        ← All goals
      </Link>

      <GoalHeader goal={goal} />

      <HaradaMatrix goal={goal} elements={elements} />
    </div>
  );
}
