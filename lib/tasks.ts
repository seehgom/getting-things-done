import "server-only";
import { supabaseServer } from "@/lib/supabase/server";
import type { CompletedTask, Task } from "@/lib/gtd";

export async function getTasks(): Promise<Task[]> {
  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

/** Tasks that have been marked Done — moved here out of `tasks` by
 * completeTask() in app/actions.ts so the active list stays current. */
export async function getCompletedTasks(): Promise<CompletedTask[]> {
  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from("completed_tasks")
    .select("*")
    .order("completed_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}
