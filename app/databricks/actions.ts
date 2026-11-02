"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";

async function requireUser() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  return userId;
}

/** Ticks/unticks a topic. Scoped to level='topic' in the query itself —
 * not just in the UI — so this can only ever flip a topic's status, per
 * the handoff spec's PATCH /api/status constraint. */
export async function setTopicStatus(id: number, done: boolean) {
  await requireUser();

  const supabase = supabaseServer();
  const { error } = await supabase
    .from("cert_study_tree")
    .update({ status: done ? "done" : "todo" })
    .eq("id", id)
    .eq("level", "topic");
  if (error) throw new Error(error.message);

  revalidatePath("/databricks");
}
