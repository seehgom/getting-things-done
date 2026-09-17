"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";

async function requireUser() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  return userId;
}

function revalidate() {
  revalidatePath("/voice-notes");
}

export async function createVoiceNote(formData: FormData) {
  await requireUser();

  const description = String(formData.get("description") ?? "").trim();
  if (!description) throw new Error("Description is required");

  const artifact_type = String(formData.get("artifact_type") ?? "").trim() || null;
  const drive_link = String(formData.get("drive_link") ?? "").trim() || null;
  const category = String(formData.get("category") ?? "").trim() || null;
  const project = String(formData.get("project") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;

  const supabase = supabaseServer();
  const { error } = await supabase.from("voice_notes").insert({
    description,
    artifact_type,
    drive_link,
    category,
    project,
    notes,
    status: "Open",
  });
  if (error) throw new Error(error.message);

  revalidate();
}

export type VoiceNoteUpdate = {
  description?: string;
  artifact_type?: string | null;
  drive_link?: string | null;
  category?: string | null;
  project?: string | null;
  status?: string | null;
  notes?: string | null;
};

export async function updateVoiceNote(id: string, fields: VoiceNoteUpdate) {
  await requireUser();

  const supabase = supabaseServer();
  const { error } = await supabase
    .from("voice_notes")
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidate();
}

export async function updateVoiceNoteAction(formData: FormData) {
  const id = String(formData.get("id"));
  await updateVoiceNote(id, {
    description: String(formData.get("description") ?? "").trim(),
    artifact_type: String(formData.get("artifact_type") ?? "").trim() || null,
    drive_link: String(formData.get("drive_link") ?? "").trim() || null,
    category: String(formData.get("category") ?? "").trim() || null,
    project: String(formData.get("project") ?? "").trim() || null,
    status: String(formData.get("status") ?? "").trim() || null,
    notes: String(formData.get("notes") ?? "").trim() || null,
  });
}

export async function setVoiceNoteStatus(id: string, status: string) {
  await updateVoiceNote(id, { status });
}

export async function deleteVoiceNote(id: string) {
  await requireUser();

  const supabase = supabaseServer();
  const { error } = await supabase.from("voice_notes").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidate();
}
