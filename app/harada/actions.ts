"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";

async function requireUser() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  return userId;
}

function revalidateGoal(id: string) {
  revalidatePath("/harada");
  revalidatePath(`/harada/${id}`);
}

/** Creates a goal plus its full 8x8 grid of (empty) elements/items up
 * front, so every cell already has a stable row id to update — neither
 * the UI nor a future AI filler ever needs to decide whether a cell
 * should be inserted or updated, only ever updateElement()/updateItem(). */
export async function createGoal(formData: FormData) {
  await requireUser();

  const title = String(formData.get("title") ?? "").trim();
  if (!title) throw new Error("Goal title is required");
  const why = String(formData.get("why") ?? "").trim() || null;
  const target_date = String(formData.get("target_date") ?? "").trim() || null;

  const supabase = supabaseServer();
  const { data: goal, error: goalError } = await supabase
    .from("harada_goals")
    .insert({ title, why, target_date })
    .select()
    .single();
  if (goalError) throw new Error(goalError.message);

  const { data: elements, error: elementsError } = await supabase
    .from("harada_elements")
    .insert(
      Array.from({ length: 8 }, (_, i) => ({ goal_id: goal.id, position: i + 1 }))
    )
    .select();
  if (elementsError) throw new Error(elementsError.message);

  const { error: itemsError } = await supabase.from("harada_items").insert(
    elements.flatMap((element: { id: string }) =>
      Array.from({ length: 8 }, (_, i) => ({ element_id: element.id, position: i + 1 }))
    )
  );
  if (itemsError) throw new Error(itemsError.message);

  revalidatePath("/harada");
  return goal.id as string;
}

export async function updateGoal(
  id: string,
  fields: { title?: string; why?: string | null; target_date?: string | null; status?: string; notes?: string | null }
) {
  await requireUser();

  const supabase = supabaseServer();
  const { error } = await supabase
    .from("harada_goals")
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidateGoal(id);
}

export async function deleteGoal(id: string) {
  await requireUser();

  const supabase = supabaseServer();
  const { error } = await supabase.from("harada_goals").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/harada");
}

export async function updateElement(id: string, goalId: string, title: string) {
  await requireUser();

  const supabase = supabaseServer();
  const { error } = await supabase
    .from("harada_elements")
    .update({ title: title.trim() || null, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidateGoal(goalId);
}

export async function updateItem(id: string, goalId: string, text: string) {
  await requireUser();

  const supabase = supabaseServer();
  const { error } = await supabase
    .from("harada_items")
    .update({ text: text.trim() || null, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidateGoal(goalId);
}

/** Promotes one matrix item to a real task in `tasks`, so a goal's
 * granular action items can actually be worked the same way as
 * anything else in the app, instead of staying words in a grid. */
export async function createTaskFromItem(
  itemId: string,
  goalId: string,
  goalTitle: string,
  elementTitle: string | null
) {
  await requireUser();

  const supabase = supabaseServer();
  const { data: item, error: itemError } = await supabase
    .from("harada_items")
    .select("text, task_id")
    .eq("id", itemId)
    .single();
  if (itemError) throw new Error(itemError.message);
  if (!item.text?.trim()) throw new Error("Fill in this cell before adding it as a task");
  if (item.task_id) return; // already linked

  const { data: task, error: taskError } = await supabase
    .from("tasks")
    .insert({
      task: item.text.trim(),
      category: "Inbox",
      status: "Open",
      notes: `From Harada goal "${goalTitle}"${elementTitle ? ` — ${elementTitle}` : ""}`,
    })
    .select("id")
    .single();
  if (taskError) throw new Error(taskError.message);

  const { error: linkError } = await supabase
    .from("harada_items")
    .update({ task_id: task.id, updated_at: new Date().toISOString() })
    .eq("id", itemId);
  if (linkError) throw new Error(linkError.message);

  revalidateGoal(goalId);
  revalidatePath("/");
}

/** Clears an item's link to a task without deleting the task itself —
 * for undoing an accidental "+ Add as task" click. */
export async function unlinkItemTask(itemId: string, goalId: string) {
  await requireUser();

  const supabase = supabaseServer();
  const { error } = await supabase
    .from("harada_items")
    .update({ task_id: null, updated_at: new Date().toISOString() })
    .eq("id", itemId);
  if (error) throw new Error(error.message);

  revalidateGoal(goalId);
}
