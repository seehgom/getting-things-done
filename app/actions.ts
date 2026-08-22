"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";

async function requireUser() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  return userId;
}

function revalidateAll() {
  revalidatePath("/");
  revalidatePath("/review");
  revalidatePath("/history");
  revalidatePath("/projects");
}

export async function createTask(formData: FormData) {
  await requireUser();

  const task = String(formData.get("task") ?? "").trim();
  if (!task) throw new Error("Task text is required");

  const category = String(formData.get("category") ?? "").trim() || "Inbox";
  const notes = String(formData.get("notes") ?? "").trim() || null;
  const due_date = String(formData.get("due_date") ?? "").trim() || null;
  const context = String(formData.get("context") ?? "").trim() || null;
  const offense_defense =
    String(formData.get("offense_defense") ?? "").trim() || null;
  const project_id = String(formData.get("project_id") ?? "").trim() || null;
  const is_next_action = formData.get("is_next_action") === "on";

  const supabase = supabaseServer();
  const { error } = await supabase.from("tasks").insert({
    task,
    category,
    notes,
    due_date,
    context,
    offense_defense,
    project_id,
    is_next_action,
    status: "Open",
  });
  if (error) throw new Error(error.message);

  revalidateAll();
}

export type TaskUpdate = {
  task?: string;
  category?: string;
  notes?: string | null;
  urgency?: string | null;
  importance?: string | null;
  due_date?: string | null;
  context?: string | null;
  offense_defense?: string | null;
  project_id?: string | null;
  is_next_action?: boolean;
  status?: string;
};

/** Any update that sets status to Done is routed through completeTask so
 * a task never sits in `tasks` marked Done — it moves to the archive. */
export async function updateTask(id: string, fields: TaskUpdate) {
  await requireUser();

  if (fields.status && fields.status.toLowerCase() === "done") {
    await completeTask(id, fields);
    return;
  }

  const supabase = supabaseServer();
  const { error } = await supabase
    .from("tasks")
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidateAll();
}

export async function updateTaskAction(formData: FormData) {
  const id = String(formData.get("id"));
  const fields: TaskUpdate = {
    task: String(formData.get("task") ?? "").trim(),
    category: String(formData.get("category") ?? "").trim() || "Inbox",
    notes: String(formData.get("notes") ?? "").trim() || null,
    urgency: String(formData.get("urgency") ?? "").trim() || null,
    importance: String(formData.get("importance") ?? "").trim() || null,
    due_date: String(formData.get("due_date") ?? "").trim() || null,
    context: String(formData.get("context") ?? "").trim() || null,
    offense_defense: String(formData.get("offense_defense") ?? "").trim() || null,
    project_id: String(formData.get("project_id") ?? "").trim() || null,
    is_next_action: formData.get("is_next_action") === "on",
    status: String(formData.get("status") ?? "Open").trim() || "Open",
  };
  await updateTask(id, fields);
}

export async function setStatus(id: string, status: string) {
  await updateTask(id, { status });
}

export async function setCategory(id: string, category: string) {
  await updateTask(id, { category });
}

export async function setOffenseDefense(id: string, value: string | null) {
  await updateTask(id, { offense_defense: value });
}

export async function setTaskProject(id: string, projectId: string | null) {
  await updateTask(id, { project_id: projectId });
}

/** Flags (or unflags) a task as its project's next action — this is what
 * deriveProjectStatus() reads to decide whether the project is Active or
 * reads as Someday/Maybe. */
export async function setNextAction(id: string, isNext: boolean) {
  await updateTask(id, { is_next_action: isNext });
}

export async function createProject(formData: FormData) {
  await requireUser();

  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("Project name is required");
  const notes = String(formData.get("notes") ?? "").trim() || null;

  const supabase = supabaseServer();
  const { error } = await supabase.from("projects").insert({ name, notes });
  if (error) throw new Error(error.message);

  revalidateAll();
}

/** Moves a task out of `tasks` into the `completed_tasks` archive — the
 * single place "done" is recorded, so History can analyze it later
 * without the active list accumulating finished items. */
export async function completeTask(id: string, overrides: TaskUpdate = {}) {
  await requireUser();

  const supabase = supabaseServer();
  const { data: row, error: fetchError } = await supabase
    .from("tasks")
    .select("*")
    .eq("id", id)
    .single();
  if (fetchError) throw new Error(fetchError.message);
  if (!row) throw new Error("Task not found");

  const now = new Date().toISOString();
  // `is_next_action` only makes sense for open tasks — completed_tasks has
  // no such column, so it's dropped rather than carried into the archive.
  const archived: Record<string, unknown> = {
    ...row,
    ...overrides,
    status: "Done",
    updated_at: now,
    completed_at: now,
  };
  delete archived.is_next_action;

  const { error: insertError } = await supabase
    .from("completed_tasks")
    .insert(archived);
  if (insertError) throw new Error(insertError.message);

  const { error: deleteError } = await supabase
    .from("tasks")
    .delete()
    .eq("id", id);
  if (deleteError) throw new Error(deleteError.message);

  revalidateAll();
}

/** Bumps updated_at without changing anything else — used during the
 * weekly review to acknowledge "still relevant" without editing fields. */
export async function touchTask(id: string) {
  await requireUser();

  const supabase = supabaseServer();
  const { error } = await supabase
    .from("tasks")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidateAll();
}

export async function deleteTask(id: string) {
  await requireUser();

  const supabase = supabaseServer();
  const { error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidateAll();
}
