import Link from "next/link";
import Section from "@/components/Section";
import SortableList from "@/components/SortableList";
import TaskItem from "@/components/TaskItem";
import { getCompletedTasks, getTasks } from "@/lib/tasks";
import {
  applyManualOrder,
  CATEGORY_SUGGESTIONS,
  CONTEXT_SUGGESTIONS,
  effectiveBucket,
  groupCompletedByParent,
} from "@/lib/gtd";

export default async function ProjectsPage() {
  const [allTasks, completedTasks] = await Promise.all([
    getTasks(),
    getCompletedTasks(),
  ]);
  const completedByParent = groupCompletedByParent(completedTasks);

  const projectTasks = allTasks.filter((t) => t.is_project);
  const active = applyManualOrder(
    projectTasks.filter((p) => effectiveBucket(p, allTasks) === "next")
  );
  const stalled = applyManualOrder(
    projectTasks.filter((p) => effectiveBucket(p, allTasks) === "someday")
  );
  const other = projectTasks.filter(
    (p) =>
      !active.some((a) => a.id === p.id) && !stalled.some((s) => s.id === p.id)
  );

  const categoriesInUse = Array.from(
    new Set(allTasks.map((t) => t.category?.trim()).filter(Boolean))
  ).sort();
  const categories = Array.from(
    new Set([...CATEGORY_SUGGESTIONS, ...categoriesInUse])
  ).sort();
  const contextsInUse = Array.from(
    new Set(
      allTasks
        .map((t) => t.context?.trim())
        .filter((c): c is string => Boolean(c))
    )
  ).sort();
  const contextOptions = Array.from(
    new Set([...CONTEXT_SUGGESTIONS, ...contextsInUse])
  ).sort();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          A project is just a task promoted to hold other tasks as its
          actions — use the &ldquo;📁 Make project&rdquo; button on any task.
          A project with an action flagged as next is{" "}
          <span className="font-medium">Active</span>; one with nothing
          flagged reads as{" "}
          <span className="font-medium">Someday/Maybe</span> until you mark
          one of its actions next.
        </p>
      </div>

      {projectTasks.length === 0 ? (
        <p className="rounded-lg border border-dashed border-card-border px-3 py-4 text-center text-xs text-muted">
          No projects yet. Open any task in your list and click
          &ldquo;📁 Make project&rdquo;, then add its actions.
        </p>
      ) : (
        <>
          <Section
            icon="⚡"
            title="Active projects"
            description="At least one action is flagged as next — these are doable right now."
            count={active.length}
          >
            {active.length === 0 ? (
              <Empty text="No projects have a next action queued yet." />
            ) : (
              <ul className="space-y-2">
                <SortableList items={active}>
                  {(p, drag, dragPending) => (
                    <TaskItem
                      key={p.id}
                      task={p}
                      categories={categories}
                      contexts={contextOptions}
                      allTasks={allTasks}
                      completedChildren={completedByParent.get(p.id) ?? []}
                      drag={drag}
                      dragPending={dragPending}
                    />
                  )}
                </SortableList>
              </ul>
            )}
          </Section>

          <Section
            icon="🌒"
            title="Someday / Maybe projects"
            description="No action is flagged as next yet, so these aren't actionable right now — mark one below to activate."
            count={stalled.length}
          >
            {stalled.length === 0 ? (
              <Empty text="Nothing stalled — every project has a next action." />
            ) : (
              <ul className="space-y-2">
                <SortableList items={stalled}>
                  {(p, drag, dragPending) => (
                    <TaskItem
                      key={p.id}
                      task={p}
                      categories={categories}
                      contexts={contextOptions}
                      allTasks={allTasks}
                      completedChildren={completedByParent.get(p.id) ?? []}
                      drag={drag}
                      dragPending={dragPending}
                    />
                  )}
                </SortableList>
              </ul>
            )}
          </Section>

          {other.length > 0 && (
            <Section
              icon="✅"
              title="Done / Waiting projects"
              count={other.length}
              defaultOpen={false}
            >
              <ul className="space-y-2">
                {other.map((p) => (
                  <TaskItem
                    key={p.id}
                    task={p}
                    categories={categories}
                    contexts={contextOptions}
                    allTasks={allTasks}
                    completedChildren={completedByParent.get(p.id) ?? []}
                  />
                ))}
              </ul>
            </Section>
          )}
        </>
      )}

      <Link
        href="/"
        className="flex items-center justify-between rounded-xl border border-card-border bg-card px-4 py-3 text-sm shadow-sm hover:border-accent"
      >
        <span>
          <span aria-hidden>⚡</span> Projects also show up in{" "}
          <span className="font-medium">Dashboard</span> and{" "}
          <span className="font-medium">Weekly Review</span> like any other
          task — this page is just a focused view of them.
        </span>
        <span aria-hidden className="text-muted">
          →
        </span>
      </Link>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <p className="rounded-lg border border-dashed border-card-border px-3 py-4 text-center text-xs text-muted">
      {text}
    </p>
  );
}
