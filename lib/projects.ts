import "server-only";
import { supabaseServer } from "@/lib/supabase/server";
import type { Project } from "@/lib/gtd";

export async function getProjects(): Promise<Project[]> {
  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}
