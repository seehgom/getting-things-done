import Link from "next/link";
import Section from "@/components/Section";
import TaskItem from "@/components/TaskItem";
import NewProjectForm from "@/components/NewProjectForm";
import { getTasks } from "@/lib/tasks";
import { getProjects } from "@/lib/projects";
import {
  buildProjectStatusMap,
  CATEGORY_SUGGESTIONS,
  CONTEXT_SUGGESTIONS,
  classify,
} from "@/lib/gtd";

export default async function ProjectsPage() {
  const [projects, allTasks] = await Promise.all([getProjects(), getTasks()]);

  const projectStatusById = buildProjectStatusMap(projects, allTasks);

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
          Any outcome that takes more than one task belongs here. A project
          with a next task queued up is <span className="font-medium">Active</span>;
          one with nothing queued reads as{" "}
          <span className="font-medium">Someday/Maybe</span> until you assign
          it one.
        </p>
      </div>

      <NewProjectForm />

      {projects.length === 0 ? (
        <p className="rounded-lg border border-dashed border-card-border px-3 py-4 text-center text-xs text-muted">
          No projects yet — create one above, then classify tasks into it
          from the task list.
        </p>
      ) : (
        <div className="space-y-4">
          {projects.map((p) => {
            const status = projectStatusById.get(p.id) ?? "Someday/Maybe";
            const projectTasks = allTasks.filter(
              (t) => t.project_id === p.id && classify(t) !== "done"
            );
            return (
              <Section
                key={p.id}
                icon="📁"
                title={p.name}
                description={p.notes ?? undefined}
                count={projectTasks.length}
              >
                <div className="mb-2 flex items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                      status === "Active"
                        ? "bg-accent/15 text-accent"
                        : "bg-warning-bg text-warning"
                    }`}
                  >
                    {status}
                  </span>
                  {status === "Someday/Maybe" && (
                    <span className="text-[11px] text-muted">
                      No next task queued — mark one below.
                    </span>
                  )}
                </div>
                {projectTasks.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-card-border px-3 py-4 text-center text-xs text-muted">
                    No tasks in this project yet. Classify a task into it
                    from the dashboard or Quick Capture.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {projectTasks.map((t) => (
                      <TaskItem
                        key={t.id}
                        task={t}
                        categories={categories}
                        contexts={contextOptions}
                        projects={projects}
                        projectStatusById={projectStatusById}
                      />
                    ))}
                  </ul>
                )}
              </Section>
            );
          })}
        </div>
      )}

      <Link
        href="/"
        className="flex items-center justify-between rounded-xl border border-card-border bg-card px-4 py-3 text-sm shadow-sm hover:border-accent"
      >
        <span>
          <span aria-hidden>⚡</span> Classify a task into a project from{" "}
          <span className="font-medium">Dashboard</span> or the Weekly
          Review — it shows up here automatically.
        </span>
        <span aria-hidden className="text-muted">
          →
        </span>
      </Link>
    </div>
  );
}
