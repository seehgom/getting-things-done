import "server-only";
import { supabaseServer } from "@/lib/supabase/server";
import type { Task } from "@/lib/gtd";

export async function getTasks(): Promise<Task[]> {
  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}
