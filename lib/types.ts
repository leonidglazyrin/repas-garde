// Types partagés pour l'app Repas Garde
export type Role = "gardienne" | "parent";
export type MealType = "souper";
export type ApprovalStatus = "pending" | "approved" | "change_requested" | "not_ok";
export const MEAL_TYPES: { id: MealType; label: string; icon: string }[] = [{ id: "souper", label: "Souper", icon: "🌙" }];
export const MEAL_LABEL: Record<MealType, string> = { souper: "Souper" };
export interface Household { id: string; name: string; invite_code: string; }
export interface Member { id: string; household_id: string; name: string; role: Role; created_at?: string; profile_color?: string; restrictions?: string; }
export interface Child { id: string; household_id: string; name: string; allergies: string; dislikes: string; notes: string; }
export interface Week { id: string; household_id: string; week_start: string; title: string; }
export interface Meal { id: string; week_id: string; day_index: number; meal_type: MealType; title: string; description: string; ingredients: string[]; notes: string; profile_ids?: string[]; updated_by?: string; updated_at?: string; }
export interface Approval { id: string; meal_id: string; member_id: string; status: ApprovalStatus; comment: string; updated_at?: string; }
export interface GroceryItem { id: string; week_id: string; name: string; category: string; quantity: string; checked: boolean; source_meal_id?: string | null; updated_by?: string; }
export interface SavedDish { id: string; household_id: string; title: string; description: string; ingredients: string[]; notes: string; last_used_at?: string; }
export const APPROVAL_META: Record<ApprovalStatus, { label: string; color: string; soft: string; icon: string }> = { pending: { label: "En attente", color: "text-faint", soft: "bg-offset", icon: "○" }, approved: { label: "Approuvé", color: "text-success", soft: "bg-success-soft", icon: "✓" }, change_requested: { label: "À modifier", color: "text-warning", soft: "bg-warning-soft", icon: "✎" }, not_ok: { label: "Ne convient pas", color: "text-danger", soft: "bg-danger-soft", icon: "✕" } };
export const GROCERY_CATEGORIES = ["Fruits & légumes","Viandes & poissons","Produits laitiers","Pain & céréales","Épicerie sèche","Surgelés","Boissons","Divers"];
export const PROFILE_COLORS = ["#7c3aed", "#2563eb", "#059669", "#ea580c", "#db2777", "#0891b2", "#ca8a04", "#dc2626"];
