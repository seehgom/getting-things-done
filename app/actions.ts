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
}

export async function createTask(formData: FormData) {
  await requireUser();

  const task = String(formData.get("task") ?? "").trim();
  if (!task) throw new Error("Task text is required");

  const category = String(formData.get("category") ?? "").trim() || "Inbox";
  const notes = String(formData.get("notes") ?? "").trim() || null;
  const due_date = String(formData.get("due_date") ?? "").trim() || null;
  const context = String(formData.get("context") ?? "").trim() || null;

  const supabase = supabaseServer();
  const { error } = await supabase.from("tasks").insert({
    task,
    category,
    notes,
    due_date,
    context,
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
  status?: string;
};

export async function updateTask(id: string, fields: TaskUpdate) {
  await requireUser();

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
    status: String(formData.get("status") ?? "Open").trim() || "Open",
  };
  await updateTask(id, fields);
}

export async function setStatus(id: string, status: string) {
  await updateTask(id, { status });
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
