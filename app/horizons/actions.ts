"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";

async function requireUser() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  return userId;
}

export async function createHorizon(formData: FormData) {
  await requireUser();

  const level = String(formData.get("level") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  if (!title) throw new Error("Title is required");

  const notes = String(formData.get("notes") ?? "").trim() || null;

  const supabase = supabaseServer();
  const { error } = await supabase.from("horizons").insert({
    level,
    title,
    notes,
    status: "Active",
  });
  if (error) throw new Error(error.message);

  revalidatePath("/horizons");
}

export type HorizonUpdate = {
  title?: string;
  notes?: string | null;
  status?: string;
};

export async function updateHorizon(id: string, fields: HorizonUpdate) {
  await requireUser();

  const supabase = supabaseServer();
  const { error } = await supabase
    .from("horizons")
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/horizons");
}

export async function updateHorizonAction(formData: FormData) {
  const id = String(formData.get("id"));
  await updateHorizon(id, {
    title: String(formData.get("title") ?? "").trim(),
    notes: String(formData.get("notes") ?? "").trim() || null,
    status: String(formData.get("status") ?? "Active").trim() || "Active",
  });
}

export async function setHorizonStatus(id: string, status: string) {
  await updateHorizon(id, { status });
}

export async function deleteHorizon(id: string) {
  await requireUser();

  const supabase = supabaseServer();
  const { error } = await supabase.from("horizons").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/horizons");
}
