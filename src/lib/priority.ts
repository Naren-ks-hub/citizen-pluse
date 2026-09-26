import type { Database } from "@/integrations/supabase/types";

export type Priority = Database["public"]["Enums"]["complaint_priority"];
export type Category = Database["public"]["Enums"]["complaint_category"];

const HIGH_KEYWORDS = [
  "accident", "bridge", "collapse", "wire", "electric", "fire", "leakage",
  "leak", "burst", "danger", "hazard", "flood", "emergency", "urgent",
];
const MEDIUM_KEYWORDS = ["broken", "damaged", "pothole", "blocked", "overflowing", "dark"];

const HIGH_CATEGORIES: Category[] = ["electricity", "drainage", "water_supply"];
const LOW_CATEGORIES: Category[] = ["parks"];

export function suggestPriority(category: Category, text: string): Priority {
  const t = text.toLowerCase();
  if (HIGH_KEYWORDS.some((k) => t.includes(k))) return "high";
  if (HIGH_CATEGORIES.includes(category)) return "high";
  if (LOW_CATEGORIES.includes(category)) return "low";
  if (MEDIUM_KEYWORDS.some((k) => t.includes(k))) return "medium";
  return "medium";
}

export const CATEGORY_LABELS: Record<Category, string> = {
  roads: "Roads",
  water_supply: "Water Supply",
  garbage: "Garbage",
  street_lights: "Street Lights",
  drainage: "Drainage",
  electricity: "Electricity",
  public_transport: "Public Transport",
  sanitation: "Sanitation",
  parks: "Parks",
  others: "Others",
};

export const CATEGORY_OPTIONS = Object.entries(CATEGORY_LABELS) as Array<[Category, string]>;
