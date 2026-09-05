"use client";
import { useCallback, useEffect, useState } from "react";
import { Onboarding } from "@/components/Onboarding";
import { Header } from "@/components/Header";
import { WeekView } from "@/components/WeekView";
import { GroceryView } from "@/components/GroceryView";
import { ChildrenView } from "@/components/ChildrenView";
import { Button, Modal, Spinner } from "@/components/ui";
import {
  getChildren,
  getGrocery,
  getHousehold,
  getMembers,
  getMeals,
  getOrCreateWeek,
  getApprovalsForWeek,
  copyWeek,
  deleteChild,
  deleteGroceryItem,
  deleteMeal,
  generateGroceryFromMeals,
  resetDemoData,
  saveChild,
  saveGroceryItem,
  saveMeal,
  setApproval as dbSetApproval,
  subscribe,
} from "@/lib/db";
import type { Approval, ApprovalStatus, Child, GroceryItem, Household, Meal, MealType, Member, Week } from "@/lib/types";
import { startOfWeek, toISODate, addDays } from "@/lib/dates";
import { CalendarDays, ShoppingCart, Baby, UtensilsCrossed, Users, RotateCcw } from "lucide-react";
import { cn } from "@/lib/cn";
import { useTheme } from "@/lib/useTheme";
import { IS_DEMO } from "@/lib/supabase";
import { storageGet, storageSet } from "@/lib/storage";

interface Session {
  householdId: string;
  memberId: string;
  name: string;
  role: "gardienne" | "parent";
}

const uid = () =>
  (crypto?.randomUUID?.() ??
    "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
    }));

export default function Page() {
  const { theme, toggle } = useTheme();
  const [session, setSession] = useState<Session | null>(null);
  const [restored, setRestored] = useState(false);

  const [weekStart, setWeekStart] = useState<Date>(startOfWeek(new Date()));
  const [household, setHousehold] = useState<Household | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [week, setWeek] = useState<Week | null>(null);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [grocery, setGrocery] = useState<GroceryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"semaine" | "epicerie" | "enfants">("semaine");
  const [membersOpen, setMembersOpen] = useState(false);
  const [pendingGrocery, setPendingGrocery] = useState(false);

  // Restaurer la session
  useEffect(() => {
    const raw = storageGet("repas-garde-session");
    if (raw) setSession(JSON.parse(raw));
    setRestored(true);
  }, []);

  useEffect(() => {
    if (!session) return;
    storageSet("repas-garde-session", JSON.stringify(session));
  }, [session]);

  const loadAll = useCallback(async () => {
    if (!session) return;
    const [h, mem, ch] = await Promise.all([
      getHousehold(session.householdId),
      getMembers(session.householdId),
      getChildren(session.householdId),
    ]);
    setHousehold(h);
    setMembers(mem);
    setChildren(ch);

    const w = await getOrCreateWeek(session.householdId, toISODate(weekStart));
    setWeek(w);
    const [ml, ap, gr] = await Promise.all([
      getMeals(w.id),
      getApprovalsForWeek(w.id),
      getGrocery(w.id),
    ]);
    setMeals(ml);
    setApprovals(ap);
    setGrocery(gr);
    setLoading(false);
  }, [session, weekStart]);

  // Temps réel : tout le monde voit les modifs
  useEffect(() => {
    if (!session) return;
    const unsub = subscribe(() => {
      loadAll();
    });
    loadAll();
    return () => {
      unsub();
      setLoading(true);
    };
  }, [session, loadAll]);

  // ---- Actions ----
  const handleAddMeal = async (dayIndex: number, type: MealType) => {
    if (!week) return;
    const meal: Meal = {
      id: uid(),
      week_id: week.id,
      day_index: dayIndex,
      meal_type: type,
      title: "",
      description: "",
      ingredients: [],
      notes: "",
      updated_by: session?.name,
    };
    await saveMeal(meal);
  };

  const handleSaveMeal = async (meal: Meal) => {
    await saveMeal({ ...meal, updated_by: session?.name });
  };

  const handleDeleteMeal = async (id: string) => {
    await deleteMeal(id);
  };

  const handleSetApproval = async (mealId: string, status: ApprovalStatus, comment: string) => {
    if (!session) return;
    await dbSetApproval(mealId, session.memberId, status, comment, session.name);
  };

  const handleGenerateGrocery = async () => {
    if (!week) return;
    setPendingGrocery(true);
    try {
      await generateGroceryFromMeals(week.id, session?.name ?? "");
      setView("epicerie");
    } finally {
      setPendingGrocery(false);
    }
  };

  const handleCopyPrevWeek = async () => {
    if (!session || !week) return;
    const prevStart = toISODate(addDays(weekStart, -7));
    await copyWeek(week.id, prevStart, session.name);
  };

  const handleGroceryUpdate = async (item: GroceryItem) => {
    await saveGroceryItem({ ...item, updated_by: session?.name });
  };
  const handleGroceryToggle = async (id: string, checked: boolean) => {
    const item = grocery.find((g) => g.id === id);
    if (!item) return;
    await saveGroceryItem({ ...item, checked, updated_by: session?.name });
  };

  if (!restored) return <Spinner />;

  if (!session) {
    return (
      <Onboarding
        onReady={(householdId, memberId, name, role) => setSession({ householdId, memberId, name, role })}
      />
    );
  }

  if (loading || !household) return <Spinner />;

  const tabs = [
    { id: "semaine" as const, label: "Semaine", icon: CalendarDays },
    { id: "epicerie" as const, label: "Épicerie", icon: ShoppingCart },
    { id: "enfants" as const, label: "Enfants", icon: Baby },
  ];

  return (
    <div className="min-h-dvh">
      <Header
        householdName={household.name}
        inviteCode={household.invite_code}
        memberName={session.name}
        memberRole={session.role}
        theme={theme}
        onToggleTheme={toggle}
        onOpenMembers={() => setMembersOpen(true)}
        childrenCount={children.length}
      />

      {/* Onglets */}
      <nav className="sticky top-14 z-20 border-b border-border bg-surface/85 backdrop-blur">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 flex">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setView(t.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium border-b-2 -mb-px transition",
                view === t.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted hover:text-text",
              )}
            >
              <t.icon size={16} /> {t.label}
              {t.id === "epicerie" && grocery.filter((g) => !g.checked).length > 0 && (
                <span className="ml-1 text-xs bg-primary text-white rounded-full px-1.5">
                  {grocery.filter((g) => !g.checked).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-3 sm:px-4 py-4">
        {view === "semaine" && (
          <WeekView
            week={week}
            meals={meals}
            approvals={approvals}
            members={members}
            currentMemberId={session.memberId}
            currentMemberName={session.name}
            currentRole={session.role}
            weekStart={weekStart}
            onWeekChange={(d) => {
              setLoading(true);
              setWeekStart(startOfWeek(d));
            }}
            onSaveMeal={handleSaveMeal}
            onDeleteMeal={handleDeleteMeal}
            onSetApproval={handleSetApproval}
            onAddMeal={handleAddMeal}
            onCopyPrevWeek={handleCopyPrevWeek}
            onGenerateGrocery={handleGenerateGrocery}
            pendingGrocery={pendingGrocery}
          />
        )}
        {view === "epicerie" && (
          <GroceryView
            items={grocery}
            currentRole={session.role}
            currentMemberName={session.name}
            onAdd={saveGroceryItem}
            onUpdate={handleGroceryUpdate}
            onDelete={deleteGroceryItem}
            onToggle={handleGroceryToggle}
          />
        )}
        {view === "enfants" && (
          <ChildrenView
            children={children}
            currentMemberName={session.name}
            onSave={saveChild}
            onDelete={deleteChild}
          />
        )}
      </main>

      <MembersModal
        open={membersOpen}
        onClose={() => setMembersOpen(false)}
        members={members}
        inviteCode={household.invite_code}
        currentRole={session.role}
        onResetDemo={IS_DEMO ? () => { resetDemoData(); setSession(null); } : undefined}
      />
    </div>
  );
}

function MembersModal({
  open,
  onClose,
  members,
  inviteCode,
  currentRole,
  onResetDemo,
}: {
  open: boolean;
  onClose: () => void;
  members: Member[];
  inviteCode: string;
  currentRole: "gardienne" | "parent";
  onResetDemo?: () => void;
}) {
  const parents = members.filter((m) => m.role === "parent");
  const gardiennes = members.filter((m) => m.role === "gardienne");
  return (
    <Modal open={open} onClose={onClose} title="Membres du foyer">
      <div className="space-y-4">
        <div className="rounded-lg bg-primary-soft p-3">
          <p className="text-xs font-medium text-primary">Code d'invitation du foyer</p>
          <p className="font-mono text-2xl tracking-[0.3em] text-center py-2 font-bold">{inviteCode}</p>
          <p className="text-xs text-muted">
            Partage ce code aux parents pour qu'ils rejoignent le foyer et valident les repas.
          </p>
        </div>

        {gardiennes.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-muted uppercase mb-1">Gardienne(s)</p>
            {gardiennes.map((m) => (
              <div key={m.id} className="flex items-center gap-2 py-1.5">
                <div className="h-7 w-7 rounded-full bg-primary-soft text-primary flex items-center justify-center text-xs font-bold">
                  {m.name[0]}
                </div>
                <span className="text-sm">{m.name}</span>
              </div>
            ))}
          </div>
        )}

        <div>
          <p className="text-xs font-semibold text-muted uppercase mb-1">Parents ({parents.length})</p>
          {parents.length === 0 ? (
            <p className="text-sm text-faint">Aucun parent n'a encore rejoint. Partage le code d'invitation.</p>
          ) : (
            parents.map((m) => (
              <div key={m.id} className="flex items-center gap-2 py-1.5">
                <div className="h-7 w-7 rounded-full bg-offset text-muted flex items-center justify-center text-xs font-bold">
                  {m.name[0]}
                </div>
                <span className="text-sm">{m.name}</span>
              </div>
            ))
          )}
        </div>

        {currentRole === "gardienne" && onResetDemo && (
          <Button variant="ghost" size="sm" onClick={onResetDemo} className="text-danger">
            <RotateCcw size={14} /> Réinitialiser les données démo
          </Button>
        )}
      </div>
    </Modal>
  );
}
