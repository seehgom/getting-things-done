import "server-only";
import { supabaseServer } from "@/lib/supabase/server";

/**
 * An entry Claude's voice chat pushes here when it produces something a
 * voice conversation can't hand back directly — a generated doc/PDF
 * uploaded to Drive, a product search's results, a link it found, etc.
 * This app only reads/writes it; voice chat is what populates it.
 */
export type VoiceNote = {
  id: string;
  description: string;
  artifact_type: string | null;
  drive_link: string | null;
  category: string | null;
  project: string | null;
  status: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export async function getVoiceNotes(): Promise<VoiceNote[]> {
  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from("voice_notes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}
