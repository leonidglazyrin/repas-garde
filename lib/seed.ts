// Données de démonstration pour la prévisualisation (mode démo).
import type { Approval, Child, GroceryItem, Household, Member, Meal, Week } from "./types";

const uid = () =>
  (crypto?.randomUUID?.() ??
    "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    }));

export interface DemoState {
  households: Record<string, Household>;
  members: Record<string, Member>;
  children: Record<string, Child>;
  weeks: Record<string, Week>;
  meals: Record<string, Meal>;
  approvals: Record<string, Approval>;
  grocery: Record<string, GroceryItem>;
}

export function seedDemo(): DemoState {
  const state: DemoState = {
    households: {},
    members: {},
    children: {},
    weeks: {},
    meals: {},
    approvals: {},
    grocery: {},
  };

  const household: Household = {
    id: uid(),
    name: "Garde de Léo & Mia",
    invite_code: "DEMO01",
  };
  state.households[household.id] = household;

  const gardienne: Member = { id: uid(), household_id: household.id, name: "Romane", role: "gardienne", created_at: new Date().toISOString() };
  const parent1: Member = { id: uid(), household_id: household.id, name: "Sophie", role: "parent", created_at: new Date().toISOString() };
  const parent2: Member = { id: uid(), household_id: household.id, name: "Marc", role: "parent", created_at: new Date().toISOString() };
  state.members[gardienne.id] = gardienne;
  state.members[parent1.id] = parent1;
  state.members[parent2.id] = parent2;

  const leo: Child = { id: uid(), household_id: household.id, name: "Léo", allergies: "Arachides", dislikes: "Brocoli", notes: "Mange bien le midi, moins le soir." };
  const mia: Child = { id: uid(), household_id: household.id, name: "Mia", allergies: "Lactose (légère)", dislikes: "Poisson", notes: "Aime les pâtes et les fruits." };
  state.children[leo.id] = leo;
  state.children[mia.id] = mia;

  // Semaine courante (lundi de cette semaine)
  const now = new Date();
  const monday = new Date(now);
  const day = now.getDay(); // 0 dim ... 6 sam
  const diff = day === 0 ? -6 : 1 - day;
  monday.setDate(now.getDate() + diff);
  const weekStart = monday.toISOString().slice(0, 10);

  const week: Week = { id: uid(), household_id: household.id, week_start: weekStart, title: "Cette semaine" };
  state.weeks[week.id] = week;

  const meals: Omit<Meal, "id">[] = [
    { week_id: week.id, day_index: 0, meal_type: "dejeuner", title: "Gruau & fruits", description: "Flocons d'avoine, banane, lait d'amande.", ingredients: ["Flocons d'avoine", "Banane", "Lait d'amande"], notes: "", updated_by: "Romane" },
    { week_id: week.id, day_index: 0, meal_type: "diner", title: "Pâtes à la sauce tomate", description: "Pâtes de blé entier, sauce tomate maison, parmesan.", ingredients: ["Pâtes", "Sauce tomate", "Parmesan"], notes: "Couper les pâtes pour Mia.", updated_by: "Romane" },
    { week_id: week.id, day_index: 0, meal_type: "souper", title: "Poulet & riz", description: "Blanc de poulet grillé, riz, courgettes.", ingredients: ["Poulet", "Riz", "Courgette"], notes: "", updated_by: "Romane" },
    { week_id: week.id, day_index: 1, meal_type: "dejeuner", title: "Pain doré", description: "Pain de mie, œufs, sirop d'érable.", ingredients: ["Pain de mie", "Œufs", "Sirop d'érable"], notes: "", updated_by: "Romane" },
    { week_id: week.id, day_index: 1, meal_type: "collation", title: "Yogourt & bleuets", description: "", ingredients: ["Yogourt", "Bleuets"], notes: "", updated_by: "Romane" },
    { week_id: week.id, day_index: 2, meal_type: "diner", title: "Sandwich dinde & fromage", description: "Pain de blé entier, dinde, fromage, concombre.", ingredients: ["Pain de blé entier", "Dinde", "Fromage", "Concombre"], notes: "Fromage sans lactose pour Mia.", updated_by: "Romane" },
    { week_id: week.id, day_index: 3, meal_type: "souper", title: "Saumon & patates", description: "Pavé de saumon, pommes de terre rôties.", ingredients: ["Saumon", "Pommes de terre", "Huile d'olive"], notes: "Vérifier avec Sophie — Mia n'aime pas le poisson.", updated_by: "Romane" },
    { week_id: week.id, day_index: 4, meal_type: "diner", title: "Soupe aux légumes", description: "Carottes, céleri, courgettes, bouillon.", ingredients: ["Carottes", "Céleri", "Courgette", "Bouillon"], notes: "", updated_by: "Romane" },
  ];
  for (const m of meals) {
    const meal: Meal = { ...m, id: uid(), updated_at: new Date().toISOString() };
    state.meals[meal.id] = meal;
  }

  // Approbations : Sophie a approuvé le premier repas, Marc a demandé une modif sur le saumon
  const mealList = Object.values(state.meals);
  const m0 = mealList[0];
  const mSaumon = mealList.find((m) => m.title.includes("Saumon"))!;
  state.approvals[uid()] = { id: uid(), meal_id: m0.id, member_id: parent1.id, status: "approved", comment: "Parfait, merci !", updated_at: new Date().toISOString() };
  state.approvals[uid()] = { id: uid(), meal_id: mSaumon.id, member_id: parent2.id, status: "change_requested", comment: "Mia ne mange pas le poisson, prévoir un substitut ?", updated_at: new Date().toISOString() };

  // Liste d'épicerie partielle
  const grocery: Omit<GroceryItem, "id">[] = [
    { week_id: week.id, name: "Flocons d'avoine", category: "Épicerie sèche", quantity: "1 sac", checked: false, source_meal_id: m0.id },
    { week_id: week.id, name: "Banane", category: "Fruits & légumes", quantity: "1 botte", checked: false, source_meal_id: m0.id },
    { week_id: week.id, name: "Pâtes", category: "Épicerie sèche", quantity: "2 boîtes", checked: true, source_meal_id: mealList[1].id },
    { week_id: week.id, name: "Poulet", category: "Viandes & poissons", quantity: "4 portions", checked: false, source_meal_id: mealList[2].id },
  ];
  for (const g of grocery) state.grocery[uid()] = { ...g, id: uid() };

  return state;
}
