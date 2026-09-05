"use client";
import { useMemo } from "react";
import type { Approval, Member, Meal, MealType, Week } from "@/lib/types";
import { MEAL_TYPES } from "@/lib/types";
import { MealCard } from "@/components/MealCard";
import { Button, EmptyState } from "@/components/ui";
import { addDays, dayShort, formatDate, formatWeekRange, parseISO, toISODate } from "@/lib/dates";
import { ChevronLeft, ChevronRight, Plus, Copy, ShoppingCart, CalendarDays } from "lucide-react";
import { cn } from "@/lib/cn";

const uid = () =>
  (crypto?.randomUUID?.() ??
    "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
    }));

export function WeekView({
  week,
  meals,
  approvals,
  members,
  currentMemberId,
  currentMemberName,
  currentRole,
  weekStart,
  onWeekChange,
  onSaveMeal,
  onDeleteMeal,
  onSetApproval,
  onAddMeal,
  onCopyPrevWeek,
  onGenerateGrocery,
  pendingGrocery,
}: {
  week: Week | null;
  meals: Meal[];
  approvals: Approval[];
  members: Member[];
  currentMemberId: string;
  currentMemberName: string;
  currentRole: "gardienne" | "parent";
  weekStart: Date;
  onWeekChange: (d: Date) => void;
  onSaveMeal: (meal: Meal) => void;
  onDeleteMeal: (id: string) => void;
  onSetApproval: (mealId: string, status: Approval["status"], comment: string) => void;
  onAddMeal: (dayIndex: number, type: MealType) => void;
  onCopyPrevWeek: () => void;
  onGenerateGrocery: () => void;
  pendingGrocery: boolean;
}) {
  const todayISO = toISODate(new Date());
  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart],
  );

  const mealsByDayType = useMemo(() => {
    const map = new Map<string, Meal>();
    for (const m of meals) map.set(`${m.day_index}-${m.meal_type}`, m);
    return map;
  }, [meals]);

  const parents = members.filter((m) => m.role === "parent");
  const hasMeals = meals.length > 0;

  return (
    <div>
      {/* Barre de navigation semaine */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" onClick={() => onWeekChange(addDays(weekStart, -7))} aria-label="Semaine précédente">
            <ChevronLeft size={16} />
          </Button>
          <div className="text-center px-2">
            <p className="font-display font-bold text-sm sm:text-base">
              {week ? week.title || "Semaine" : "Semaine"}
            </p>
            <p className="text-xs text-faint">{formatWeekRange(toISODate(weekStart))}</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => onWeekChange(addDays(weekStart, 7))} aria-label="Semaine suivante">
            <ChevronRight size={16} />
          </Button>
        </div>
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="sm" onClick={() => onWeekChange(new Date())}>
            <CalendarDays size={14} /> <span className="hidden sm:inline">Aujourd'hui</span>
          </Button>
        </div>
      </div>

      {/* Actions pratiques */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Button variant="soft" size="sm" onClick={onCopyPrevWeek} disabled={currentRole !== "gardienne"}>
          <Copy size={14} /> Copier la semaine précédente
        </Button>
        <Button size="sm" onClick={onGenerateGrocery} disabled={!hasMeals || pendingGrocery}>
          <ShoppingCart size={14} /> {pendingGrocery ? "Génération…" : "Générer la liste d'épicerie"}
        </Button>
      </div>

      {!hasMeals && currentRole === "gardienne" && (
        <div className="mb-4 rounded-lg border border-dashed border-border p-4">
          <EmptyState
            icon={<Plus size={28} />}
            title="Semaine vide"
            hint="Clique sur « + » dans une case pour ajouter un repas, ou copie la semaine précédente."
          />
        </div>
      )}

      {/* Grille des jours — scroll horizontal sur mobile */}
      <div className="overflow-x-auto thin-scroll -mx-3 px-3 pb-2">
        <div className="flex gap-3 min-w-max sm:min-w-0">
          {days.map((d, i) => {
            const isToday = toISODate(d) === todayISO;
            return (
              <div key={i} className="flex flex-col gap-2 w-[260px] sm:w-0 sm:flex-1 sm:min-w-[150px] shrink-0">
                <div className={cn("rounded-md px-2 py-1.5 text-center", isToday ? "bg-primary-soft" : "bg-offset")}>
                  <p className={cn("text-xs font-semibold", isToday ? "text-primary" : "text-muted")}>
                    {dayShort(i)}
                  </p>
                  <p className="text-sm font-bold leading-tight">{formatDate(d).split(" ").slice(1).join(" ")}</p>
                </div>
                {MEAL_TYPES.map((mt) => {
                  const meal = mealsByDayType.get(`${i}-${mt.id}`);
                  return (
                    <div key={mt.id}>
                      <div className="flex items-center gap-1 mb-1">
                        <span className="text-sm">{mt.icon}</span>
                        <span className="text-xs font-medium text-muted">{mt.label}</span>
                        {!meal && currentRole === "gardienne" && (
                          <button
                            onClick={() => onAddMeal(i, mt.id)}
                            className="ml-auto text-faint hover:text-primary p-0.5 rounded"
                            aria-label={`Ajouter ${mt.label}`}
                          >
                            <Plus size={14} />
                          </button>
                        )}
                      </div>
                      {meal ? (
                        <MealCard
                          meal={meal}
                          members={members}
                          approvals={approvals.filter((a) => a.meal_id === meal.id)}
                          currentMemberId={currentMemberId}
                          currentMemberName={currentMemberName}
                          currentRole={currentRole}
                          onSave={onSaveMeal}
                          onDelete={() => onDeleteMeal(meal.id)}
                          onSetApproval={(status, comment) => onSetApproval(meal.id, status, comment)}
                        />
                      ) : (
                        <div className="rounded-lg border border-dashed border-border p-2 text-center">
                          <span className="text-xs text-faint">—</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
