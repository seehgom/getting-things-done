import "server-only";
import { supabaseServer } from "@/lib/supabase/server";

export type HorizonLevel = "10k" | "20k" | "30k" | "40k" | "50k";

export type Horizon = {
  id: string;
  level: HorizonLevel;
  title: string;
  notes: string | null;
  status: "Active" | "Someday" | "Archived";
  created_at: string;
  updated_at: string;
};

/**
 * Allen's "horizons of focus" — altitudes from ground level up to purpose.
 * Ground (0 ft, Next Actions) isn't stored here since it's already the
 * `tasks` table; this covers the five altitudes above it, ordered top to
 * bottom the way the book presents them.
 */
export const HORIZON_LEVELS: {
  level: HorizonLevel;
  altitude: string;
  name: string;
  description: string;
}[] = [
  {
    level: "50k",
    altitude: "50,000 ft",
    name: "Purpose & Values",
    description:
      "The fundamental reason any of the rest of it matters — the \"why\" everything below is in service of.",
  },
  {
    level: "40k",
    altitude: "40,000 ft",
    name: "Vision",
    description: "Your longer-range trajectory, three to five years out.",
  },
  {
    level: "30k",
    altitude: "30,000 ft",
    name: "Goals",
    description: "Medium-term outcomes you're aiming toward this year or two.",
  },
  {
    level: "20k",
    altitude: "20,000 ft",
    name: "Areas of Responsibility",
    description:
      "Ongoing roles and domains you're accountable for maintaining, not completing — health, finances, a team, a role as a parent.",
  },
  {
    level: "10k",
    altitude: "10,000 ft",
    name: "Current Projects",
    description:
      "Active, multi-step outcomes you're pursuing right now — reviewed regularly, not where the work itself happens.",
  },
];

export async function getHorizons(): Promise<Horizon[]> {
  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from("horizons")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}
