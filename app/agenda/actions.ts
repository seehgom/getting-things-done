"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";

async function requireUser() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  return userId;
}

function revalidateAgendaPages() {
  revalidatePath("/agenda-1");
  revalidatePath("/agenda-2");
  revalidatePath("/agenda-3");
  revalidatePath("/");
}

/** Assigns (or, with date=null, clears) an existing task's day-planning
 * slot — separate from due_date, which is a deadline rather than "this is
 * what I'm doing today." Shared by all three agenda page layouts. */
export async function scheduleTask(
  id: string,
  date: string | null,
  slot: string | null = null
) {
  await requireUser();

  const supabase = supabaseServer();
  const { error } = await supabase
    .from("tasks")
    .update({
      agenda_date: date,
      agenda_slot: date ? slot : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidateAgendaPages();
}

/** Creates a brand-new task already scheduled onto a day's agenda, for
 * the "quick add" box on each agenda page — skips the fuller
 * createTask()/Quick Capture flow since an agenda entry only needs a
 * title, category, and when. */
export async function createAgendaTask(formData: FormData) {
  await requireUser();

  const task = String(formData.get("task") ?? "").trim();
  if (!task) throw new Error("Task text is required");

  const category = String(formData.get("category") ?? "").trim() || "Inbox";
  const agenda_date = String(formData.get("agenda_date") ?? "").trim() || null;
  const agenda_slot = String(formData.get("agenda_slot") ?? "").trim() || null;

  const supabase = supabaseServer();
  const { error } = await supabase.from("tasks").insert({
    task,
    category,
    agenda_date,
    agenda_slot,
    status: "Open",
  });
  if (error) throw new Error(error.message);

  revalidateAgendaPages();
}
