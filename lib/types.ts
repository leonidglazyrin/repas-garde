// Types partagés pour l'app Repas Garde

export type Role = "gardienne" | "parent";
export type MealType = "dejeuner" | "diner" | "souper" | "collation";
export type ApprovalStatus = "pending" | "approved" | "change_requested" | "not_ok";

export const MEAL_TYPES: { id: MealType; label: string; icon: string }[] = [
  { id: "dejeuner", label: "Déjeuner", icon: "🌅" },
  { id: "diner", label: "Dîner", icon: "☀️" },
  { id: "souper", label: "Souper", icon: "🌙" },
  { id: "collation", label: "Collation", icon: "🍎" },
];

export const MEAL_LABEL: Record<MealType, string> = {
  dejeuner: "Déjeuner",
  diner: "Dîner",
  souper: "Souper",
  collation: "Collation",
};

export interface Household {
  id: string;
  name: string;
  invite_code: string;
}

export interface Member {
  id: string;
  household_id: string;
  name: string;
  role: Role;
  created_at?: string;
}

export interface Child {
  id: string;
  household_id: string;
  name: string;
  allergies: string;
  dislikes: string;
  notes: string;
}

export interface Week {
  id: string;
  household_id: string;
  week_start: string; // YYYY-MM-DD (lundi)
  title: string;
}

export interface Meal {
  id: string;
  week_id: string;
  day_index: number; // 0 = lundi
  meal_type: MealType;
  title: string;
  description: string;
  ingredients: string[];
  notes: string;
  updated_by?: string;
  updated_at?: string;
}

export interface Approval {
  id: string;
  meal_id: string;
  member_id: string;
  status: ApprovalStatus;
  comment: string;
  updated_at?: string;
}

export interface GroceryItem {
  id: string;
  week_id: string;
  name: string;
  category: string;
  quantity: string;
  checked: boolean;
  source_meal_id?: string | null;
  updated_by?: string;
}

export const APPROVAL_META: Record<
  ApprovalStatus,
  { label: string; color: string; soft: string; icon: string }
> = {
  pending: { label: "En attente", color: "text-faint", soft: "bg-offset", icon: "○" },
  approved: { label: "Approuvé", color: "text-success", soft: "bg-success-soft", icon: "✓" },
  change_requested: { label: "À modifier", color: "text-warning", soft: "bg-warning-soft", icon: "✎" },
  not_ok: { label: "Ne convient pas", color: "text-danger", soft: "bg-danger-soft", icon: "✕" },
};

export const GROCERY_CATEGORIES = [
  "Fruits & légumes",
  "Viandes & poissons",
  "Produits laitiers",
  "Pain & céréales",
  "Épicerie sèche",
  "Surgelés",
  "Boissons",
  "Divers",
];
