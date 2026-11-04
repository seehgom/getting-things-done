import "server-only";
import { supabaseServer } from "@/lib/supabase/server";

/** One row of a self-referencing tree: exam -> section -> topic -> resource. */
export type StudyRow = {
  id: number;
  parent_id: number | null;
  level: string;
  title: string;
  weight_pct: number | null;
  resource_type: string | null;
  url: string | null;
  notes: string | null;
  sort_order: number;
  status: string;
};

export async function getStudyTree(exam: string): Promise<StudyRow[]> {
  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from("cert_study_tree")
    .select(
      "id, parent_id, level, title, weight_pct, resource_type, url, notes, sort_order, status"
    )
    .eq("exam", exam)
    .order("sort_order", { ascending: true })
    .order("id", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export type SectionView = {
  id: number;
  title: string;
  weightPct: number;
  topics: StudyRow[];
  resources: StudyRow[];
  doneCount: number;
  totalCount: number;
};

/**
 * Resources are stored attached to a section's first topic (that's how
 * the data was loaded), not spread across every topic, so they're
 * collected here by section — any resource whose parent is one of the
 * section's topics — rather than nested per topic.
 */
export function buildSections(rows: StudyRow[]): SectionView[] {
  return rows
    .filter((r) => r.level === "section")
    .map((section) => {
      const topics = rows
        .filter((r) => r.level === "topic" && r.parent_id === section.id)
        .sort((a, b) => a.sort_order - b.sort_order);
      const topicIds = new Set(topics.map((t) => t.id));
      const resources = rows.filter(
        (r) =>
          r.level === "resource" &&
          r.parent_id !== null &&
          topicIds.has(r.parent_id)
      );
      return {
        id: section.id,
        title: section.title,
        weightPct: section.weight_pct ?? 0,
        topics,
        resources,
        doneCount: topics.filter((t) => t.status === "done").length,
        totalCount: topics.length,
      };
    });
}
