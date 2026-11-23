import "server-only";
import { supabaseServer } from "@/lib/supabase/server";

/**
 * Takashi Harada's "Open Window 64" goal-achievement matrix: one main
 * goal, broken into 8 key elements, each broken into 8 specific action
 * items (8x8 = 64 cells total). Elements/items are normalized rows
 * rather than fixed columns on the goal, specifically so a future AI
 * helper can fill them in the same way the UI does — read whichever
 * cells are still empty via getHaradaMatrix(), then call the same
 * updateElement()/updateItem() actions a human would.
 */
export type HaradaGoal = {
  id: string;
  title: string;
  why: string | null;
  target_date: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type HaradaElement = {
  id: string;
  goal_id: string;
  position: number;
  title: string | null;
  created_at: string;
  updated_at: string;
};

export type HaradaItem = {
  id: string;
  element_id: string;
  position: number;
  text: string | null;
  task_id: string | null;
  created_at: string;
  updated_at: string;
};

export type HaradaElementWithItems = HaradaElement & { items: HaradaItem[] };

export async function getHaradaGoals(): Promise<HaradaGoal[]> {
  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from("harada_goals")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getHaradaGoal(id: string): Promise<HaradaGoal | null> {
  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from("harada_goals")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ?? null;
}

/** The full 8x8 grid for one goal, elements and items each sorted by
 * their fixed position (1-8) so the UI renders a stable layout. */
export async function getHaradaMatrix(
  goalId: string
): Promise<HaradaElementWithItems[]> {
  const supabase = supabaseServer();
  const { data: elements, error: elementsError } = await supabase
    .from("harada_elements")
    .select("*")
    .eq("goal_id", goalId)
    .order("position", { ascending: true });
  if (elementsError) throw new Error(elementsError.message);

  const elementIds = (elements ?? []).map((e) => e.id);
  let items: HaradaItem[] = [];
  if (elementIds.length > 0) {
    const { data, error: itemsError } = await supabase
      .from("harada_items")
      .select("*")
      .in("element_id", elementIds)
      .order("position", { ascending: true });
    if (itemsError) throw new Error(itemsError.message);
    items = data ?? [];
  }

  return (elements ?? []).map((element) => ({
    ...element,
    items: items.filter((item) => item.element_id === element.id),
  }));
}

/** How many of a goal's 64 item cells have text in them — a quick
 * progress signal for the goals list. */
export function countFilledItems(elements: HaradaElementWithItems[]): {
  filled: number;
  total: number;
} {
  const allItems = elements.flatMap((e) => e.items);
  return {
    filled: allItems.filter((i) => (i.text ?? "").trim().length > 0).length,
    total: allItems.length,
  };
}
