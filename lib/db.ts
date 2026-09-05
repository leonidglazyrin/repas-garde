// Couche de données — Supabase réel si configuré, sinon mode démo en mémoire.
// Même interface pour les deux modes → l'UI ne change pas.
import { getSupabase, IS_DEMO } from "./supabase";
import { storageGet, storageSet } from "@/lib/storage";
import { seedDemo } from "./seed";
import type {
  Approval,
  ApprovalStatus,
  Child,
  GroceryItem,
  Household,
  Member,
  Meal,
  Week,
} from "./types";

const uid = () =>
  (crypto?.randomUUID?.() ??
    "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    }));

const now = () => new Date().toISOString();

// ---------------- État démo ----------------
interface DemoState {
  households: Record<string, Household>;
  members: Record<string, Member>;
  children: Record<string, Child>;
  weeks: Record<string, Week>;
  meals: Record<string, Meal>;
  approvals: Record<string, Approval>;
  grocery: Record<string, GroceryItem>;
}

let demo: DemoState = seedDemo();

// Persistance (fonctionne sur Vercel ; bloquée en prévisualisation iframe → ignorée)
function persist() {
  storageSet("repas-garde-demo", JSON.stringify(demo));
}
try {
  const raw = storageGet("repas-garde-demo");
  if (raw) demo = { ...seedDemo(), ...JSON.parse(raw) };
} catch {
  /* ignore */
}

// Pub/sub simple pour simuler le temps réel en mode démo
type Listener = () => void;
const listeners = new Set<Listener>();
function emit() {
  persist();
  listeners.forEach((l) => l());
}

// ---------------- Outils ----------------
export function genInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

// =====================================================================
//  FOYER & MEMBRES
// =====================================================================
export async function createHousehold(name: string): Promise<{ household: Household; member: Member }> {
  const household: Household = { id: uid(), name, invite_code: genInviteCode() };
  const member: Member = { id: uid(), household_id: household.id, name: "Toi", role: "gardienne", created_at: now() };
  if (IS_DEMO) {
    demo.households[household.id] = household;
    demo.members[member.id] = member;
    emit();
  } else {
    const sb = getSupabase()!;
    await sb.from("households").insert(household);
    await sb.from("members").insert(member);
  }
  return { household, member };
}

export async function joinHousehold(
  code: string,
  name: string,
  role: Member["role"],
): Promise<{ household: Household; member: Member } | null> {
  if (IS_DEMO) {
    let h = Object.values(demo.households).find((x) => x.invite_code.toUpperCase() === code.toUpperCase());
    if (!h) {
      h = { id: uid(), name: `Foyer ${code.toUpperCase()}`, invite_code: code.toUpperCase() };
      demo.households[h.id] = h;
    }
    const member: Member = { id: uid(), household_id: h.id, name, role, created_at: now() };
    demo.members[member.id] = member;
    emit();
    return { household: h, member };
  }
  const sb = getSupabase()!;
  const { data: h } = await sb.from("households").select("*").eq("invite_code", code.toUpperCase()).maybeSingle();
  if (!h) return null;
  const member: Member = { id: uid(), household_id: h.id, name, role, created_at: now() };
  await sb.from("members").insert(member);
  return { household: h as Household, member };
}

export async function getHousehold(id: string): Promise<Household | null> {
  if (IS_DEMO) return demo.households[id] ?? null;
  const sb = getSupabase()!;
  const { data } = await sb.from("households").select("*").eq("id", id).maybeSingle();
  return (data as Household) ?? null;
}

export async function getMembers(householdId: string): Promise<Member[]> {
  if (IS_DEMO) return Object.values(demo.members).filter((m) => m.household_id === householdId);
  const sb = getSupabase()!;
  const { data } = await sb.from("members").select("*").eq("household_id", householdId).order("created_at");
  return (data as Member[]) ?? [];
}

// =====================================================================
//  ENFANTS
// =====================================================================
export async function getChildren(householdId: string): Promise<Child[]> {
  if (IS_DEMO) return Object.values(demo.children).filter((c) => c.household_id === householdId);
  const sb = getSupabase()!;
  const { data } = await sb.from("children").select("*").eq("household_id", householdId).order("name");
  return (data as Child[]) ?? [];
}

export async function saveChild(child: Child): Promise<void> {
  if (IS_DEMO) {
    demo.children[child.id] = child;
    emit();
    return;
  }
  const sb = getSupabase()!;
  await sb.from("children").upsert(child);
}

export async function deleteChild(id: string): Promise<void> {
  if (IS_DEMO) {
    delete demo.children[id];
    emit();
    return;
  }
  const sb = getSupabase()!;
  await sb.from("children").delete().eq("id", id);
}

// =====================================================================
//  SEMAINES & REPAS
// =====================================================================
export async function getOrCreateWeek(householdId: string, weekStart: string, title = ""): Promise<Week> {
  if (IS_DEMO) {
    const existing = Object.values(demo.weeks).find((w) => w.household_id === householdId && w.week_start === weekStart);
    if (existing) return existing;
    const w: Week = { id: uid(), household_id: householdId, week_start: weekStart, title };
    demo.weeks[w.id] = w;
    emit();
    return w;
  }
  const sb = getSupabase()!;
  const { data: found } = await sb
    .from("weeks")
    .select("*")
    .eq("household_id", householdId)
    .eq("week_start", weekStart)
    .maybeSingle();
  if (found) return found as Week;
  const w: Week = { id: uid(), household_id: householdId, week_start: weekStart, title };
  const { data } = await sb.from("weeks").insert(w).select().single();
  return data as Week;
}

export async function getMeals(weekId: string): Promise<Meal[]> {
  if (IS_DEMO) return Object.values(demo.meals).filter((m) => m.week_id === weekId);
  const sb = getSupabase()!;
  const { data } = await sb.from("meals").select("*").eq("week_id", weekId);
  return (data as Meal[]) ?? [];
}

export async function saveMeal(meal: Meal): Promise<void> {
  if (IS_DEMO) {
    demo.meals[meal.id] = { ...meal, updated_at: now() };
    emit();
    return;
  }
  const sb = getSupabase()!;
  await sb.from("meals").upsert({ ...meal, updated_at: now() });
}

export async function deleteMeal(id: string): Promise<void> {
  if (IS_DEMO) {
    delete demo.meals[id];
    // nettoyer les approbations liées
    Object.values(demo.approvals).forEach((a) => {
      if (a.meal_id === id) delete demo.approvals[a.id];
    });
    emit();
    return;
  }
  const sb = getSupabase()!;
  await sb.from("meals").delete().eq("id", id);
}

// =====================================================================
//  APPROBATIONS (cases à cocher des parents avant l'épicerie)
// =====================================================================
export async function getApprovalsForWeek(weekId: string): Promise<Approval[]> {
  if (IS_DEMO) {
    const mealIds = new Set(Object.values(demo.meals).filter((m) => m.week_id === weekId).map((m) => m.id));
    return Object.values(demo.approvals).filter((a) => mealIds.has(a.meal_id));
  }
  const sb = getSupabase()!;
  const meals = await getMeals(weekId);
  const ids = meals.map((m) => m.id);
  if (!ids.length) return [];
  const { data } = await sb.from("meal_approvals").select("*").in("meal_id", ids);
  return (data as Approval[]) ?? [];
}

export async function setApproval(
  mealId: string,
  memberId: string,
  status: ApprovalStatus,
  comment: string,
  memberName: string,
): Promise<void> {
  if (IS_DEMO) {
    const existing = Object.values(demo.approvals).find((a) => a.meal_id === mealId && a.member_id === memberId);
    if (existing) {
      existing.status = status;
      existing.comment = comment;
      existing.updated_at = now();
    } else {
      const a: Approval = { id: uid(), meal_id: mealId, member_id: memberId, status, comment, updated_at: now() };
      demo.approvals[a.id] = a;
    }
    emit();
    return;
  }
  const sb = getSupabase()!;
  await sb
    .from("meal_approvals")
    .upsert(
      { meal_id: mealId, member_id: memberId, status, comment, updated_at: now() },
      { onConflict: "meal_id,member_id" },
    );
}

// =====================================================================
//  LISTE D'ÉPICERIE
// =====================================================================
export async function getGrocery(weekId: string): Promise<GroceryItem[]> {
  if (IS_DEMO) return Object.values(demo.grocery).filter((g) => g.week_id === weekId);
  const sb = getSupabase()!;
  const { data } = await sb.from("grocery_items").select("*").eq("week_id", weekId).order("category, name");
  return (data as GroceryItem[]) ?? [];
}

export async function saveGroceryItem(item: GroceryItem): Promise<void> {
  if (IS_DEMO) {
    demo.grocery[item.id] = item;
    emit();
    return;
  }
  const sb = getSupabase()!;
  await sb.from("grocery_items").upsert({ ...item, updated_at: now() });
}

export async function deleteGroceryItem(id: string): Promise<void> {
  if (IS_DEMO) {
    delete demo.grocery[id];
    emit();
    return;
  }
  const sb = getSupabase()!;
  await sb.from("grocery_items").delete().eq("id", id);
}

export async function generateGroceryFromMeals(weekId: string, memberName: string): Promise<void> {
  const meals = await getMeals(weekId);
  const approvals = await getApprovalsForWeek(weekId);
  // On prend les ingrédients des repas qui n'ont PAS de refus ("not_ok") d'un parent.
  // En pratique: un repas est retenu si aucun parent ne l'a marqué "ne convient pas".
  const mealById = new Map(meals.map((m) => [m.id, m]));
  const rejectedMeals = new Set(
    approvals.filter((a) => a.status === "not_ok").map((a) => a.meal_id),
  );
  const keptMeals = meals.filter((m) => !rejectedMeals.has(m.id));

  // Construire la liste des ingrédients existants pour ne pas dupliquer
  const existing = await getGrocery(weekId);
  const existingNames = new Set(existing.map((g) => g.name.toLowerCase()));

  const toAdd: GroceryItem[] = [];
  for (const meal of keptMeals) {
    for (const ing of meal.ingredients) {
      const name = ing.trim();
      if (!name) continue;
      if (existingNames.has(name.toLowerCase())) continue;
      existingNames.add(name.toLowerCase());
      toAdd.push({
        id: uid(),
        week_id: weekId,
        name,
        category: guessCategory(name),
        quantity: "",
        checked: false,
        source_meal_id: meal.id,
        updated_by: memberName,
      });
    }
  }
  if (!toAdd.length) return;
  if (IS_DEMO) {
    toAdd.forEach((g) => (demo.grocery[g.id] = g));
    emit();
    return;
  }
  const sb = getSupabase()!;
  await sb.from("grocery_items").insert(toAdd);
}

function guessCategory(name: string): string {
  const n = name.toLowerCase();
  const rules: [string[], string][] = [
    [["pomme", "banane", "poire", "orange", "fraise", "bleuet", "laitue", "carotte", "tomate", "oignon", "ail", "épinard", "brocoli", "poivron", "courgette", "zucchini", "patate", "pomme de terre", "celeri", "céleri", "avocat", "citron", "lime", "raisin", "melon", "concombre", "champignon", "légume", "fruit"], "Fruits & légumes"],
    [["poulet", "boeuf", "bœuf", "porc", "dinde", "jambon", "saumon", "poisson", "crevette", "bacon", "viande", "haché", "steak", "côtelette"], "Viandes & poissons"],
    [["lait", "fromage", "beurre", "œuf", "oeuf", "yogourt", "yaourt", "crème", "creme", "margarine"], "Produits laitiers"],
    [["pain", "tortilla", "pâtes", "pates", "riz", "couscous", "quinoa", "céréale", "cereale", "farine", "croissant", "bagel", "mie", "craquelin", "biscotte"], "Pain & céréales"],
    [["pâtes", "pate", "sauce", "huile", "épice", "epice", "sel", "poivre", "sucre", "farine", "levure", "miel", "beurre d'arachide", "confiture", "mayonnaise", "moutarde", "ketchup", "vinaigre", "cacao", "chocolat"], "Épicerie sèche"],
    [["surgelé", "surgele", "frites", "pizza congelé", "glace"], "Surgelés"],
    [["jus", "eau", "boisson", "thé", "the", "café", "cafe", "lait"], "Boissons"],
  ];
  for (const [keywords, cat] of rules) {
    if (keywords.some((k) => n.includes(k))) return cat;
  }
  return "Divers";
}

// =====================================================================
//  COPIER LA SEMAINE (réutilisation hebdomadaire)
// =====================================================================
export async function copyWeek(fromWeekId: string, toWeekStart: string, memberName: string): Promise<Week> {
  const src = IS_DEMO
    ? demo.weeks[fromWeekId]
    : ((await getSupabase()!.from("weeks").select("*").eq("id", fromWeekId).maybeSingle()).data as Week);
  if (!src) throw new Error("Semaine source introuvable");
  const target = await getOrCreateWeek(src.household_id, toWeekStart);
  const srcMeals = await getMeals(fromWeekId);
  for (const m of srcMeals) {
    const newMeal: Meal = {
      ...m,
      id: uid(),
      week_id: target.id,
      updated_by: memberName,
      updated_at: now(),
    };
    if (IS_DEMO) {
      demo.meals[newMeal.id] = newMeal;
    } else {
      await getSupabase()!.from("meals").insert(newMeal);
    }
  }
  if (IS_DEMO) emit();
  return target;
}

// =====================================================================
//  TEMPS RÉEL — tout le monde voit les modifications
// =====================================================================
export function subscribe(cb: () => void): () => void {
  if (IS_DEMO) {
    listeners.add(cb);
    return () => listeners.delete(cb);
  }
  const sb = getSupabase()!;
  const channel = sb
    .channel("repas-garde-changes")
    .on("postgres_changes", { event: "*", schema: "public" }, () => cb())
    .subscribe();
  return () => {
    sb.removeChannel(channel);
  };
}

export function resetDemoData() {
  demo = seedDemo();
  persist();
  emit();
}
