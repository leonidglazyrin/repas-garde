"use client";
import { useState } from "react";
import type { Approval, ApprovalStatus, Member, Meal } from "@/lib/types";
import { APPROVAL_META, MEAL_LABEL } from "@/lib/types";
import { Badge, Button, Checkbox, Input, Modal, Textarea } from "@/components/ui";
import { Pencil, Trash2, AlertTriangle, MessageSquare } from "lucide-react";
import { cn } from "@/lib/cn";

const uid = () =>
  (crypto?.randomUUID?.() ??
    "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
    }));

export function MealCard({
  meal,
  members,
  approvals,
  currentMemberId,
  currentMemberName,
  currentRole,
  onSave,
  onDelete,
  onSetApproval,
}: {
  meal: Meal;
  members: Member[];
  approvals: Approval[];
  currentMemberId: string;
  currentMemberName: string;
  currentRole: "gardienne" | "parent";
  onSave: (meal: Meal) => void;
  onDelete: () => void;
  onSetApproval: (status: ApprovalStatus, comment: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [commenting, setCommenting] = useState(false);
  const [comment, setComment] = useState("");

  const parents = members.filter((m) => m.role === "parent");
  const myApproval = approvals.find((a) => a.member_id === currentMemberId);
  const isParent = currentRole === "parent";

  const approvedCount = approvals.filter((a) => a.status === "approved").length;
  const rejected = approvals.some((a) => a.status === "not_ok");
  const allAnswered = parents.length > 0 && approvals.length >= parents.length;
  const fullyApproved = allAnswered && approvedCount === parents.length;

  const statusIcon = rejected ? "danger" : fullyApproved ? "success" : allAnswered ? "warning" : "faint";
  const statusText = rejected
    ? "Refusé par un parent"
    : fullyApproved
      ? "Validé par tous"
      : allAnswered
        ? "À ajuster"
        : `${approvedCount}/${parents.length} parents`;

  return (
    <>
      <div className="rounded-lg border border-border bg-surface p-3 hover:shadow-sm transition group animate-fadein">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h4 className="font-semibold text-sm leading-snug">{meal.title || "Repas à définir"}</h4>
          {currentRole === "gardienne" && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
              <button onClick={() => setEditing(true)} className="p-1 text-faint hover:text-primary rounded" aria-label="Modifier">
                <Pencil size={14} />
              </button>
              <button onClick={onDelete} className="p-1 text-faint hover:text-danger rounded" aria-label="Supprimer">
                <Trash2 size={14} />
              </button>
            </div>
          )}
        </div>

        {meal.description && <p className="text-xs text-muted mb-2">{meal.description}</p>}

        {meal.ingredients.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {meal.ingredients.map((ing, i) => (
              <span key={i} className="text-xs bg-offset text-muted rounded px-1.5 py-0.5">
                {ing}
              </span>
            ))}
          </div>
        )}

        {meal.notes && (
          <p className="text-xs text-warning flex items-start gap-1 mb-2">
            <AlertTriangle size={12} className="mt-0.5 shrink-0" /> {meal.notes}
          </p>
        )}

        {/* Statut d'approbation */}
        <div className="flex items-center justify-between pt-2 border-t border-divider">
          <Badge className={cn("bg-offset", `text-${statusIcon}`)}>
            {rejected ? "✕" : fullyApproved ? "✓" : "○"} {statusText}
          </Badge>
          {isParent && (
            <button
              onClick={() => {
                setComment(myApproval?.comment ?? "");
                setCommenting(true);
              }}
              className="text-xs text-primary font-medium flex items-center gap-1 hover:underline"
            >
              <MessageSquare size={12} /> {myApproval?.status === "approved" ? "Modifier" : "Donner avis"}
            </button>
          )}
        </div>
      </div>

      {/* Dialogue d'édition (gardienne) */}
      <MealEditDialog
        open={editing}
        onClose={() => setEditing(false)}
        meal={meal}
        onSave={(m) => {
          onSave(m);
          setEditing(false);
        }}
      />

      {/* Dialogue d'approbation (parent) */}
      <Modal
        open={commenting}
        onClose={() => setCommenting(false)}
        title="Ton avis sur ce repas"
        footer={
          <Button
            variant="ghost"
            onClick={() => {
              onSetApproval("pending", "");
              setCommenting(false);
            }}
          >
            Réinitialiser
          </Button>
        }
      >
        <div className="space-y-3">
          <p className="text-sm font-medium text-text">{meal.title}</p>
          {meal.description && <p className="text-xs text-muted">{meal.description}</p>}
          <div className="grid grid-cols-3 gap-2">
            {([
              ["approved", "Ça convient", "✓"],
              ["change_requested", "À modifier", "✎"],
              ["not_ok", "Non", "✕"],
            ] as [ApprovalStatus, string, string][]).map(([st, label, ic]) => {
              const active = myApproval?.status === st;
              const meta = APPROVAL_META[st];
              return (
                <button
                  key={st}
                  onClick={() => onSetApproval(st, comment)}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-lg border p-3 text-xs transition",
                    active
                      ? cn(meta.soft, `text-${meta.color.replace("text-", "")}`, "border-current")
                      : "border-border hover:bg-offset",
                  )}
                >
                  <span className="text-lg">{ic}</span>
                  {label}
                </button>
              );
            })}
          </div>
          <div>
            <label className="text-xs font-medium text-muted">Commentaire (optionnel)</label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Ex : Léo n'aime pas le poisson, prévoir un substitut ?"
              className="mt-1"
            />
          </div>
          <Button
            onClick={() => {
              const status: ApprovalStatus = myApproval?.status ?? "change_requested";
              onSetApproval(status, comment);
              setCommenting(false);
            }}
            className="w-full"
          >
            Enregistrer
          </Button>
        </div>
      </Modal>
    </>
  );
}

function MealEditDialog({
  open,
  onClose,
  meal,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  meal: Meal;
  onSave: (meal: Meal) => void;
}) {
  const [title, setTitle] = useState(meal.title);
  const [description, setDescription] = useState(meal.description);
  const [ingredients, setIngredients] = useState(meal.ingredients.join("\n"));
  const [notes, setNotes] = useState(meal.notes);

  // re-sync quand on ouvre un autre repas
  const [lastId, setLastId] = useState(meal.id);
  if (lastId !== meal.id) {
    setLastId(meal.id);
    setTitle(meal.title);
    setDescription(meal.description);
    setIngredients(meal.ingredients.join("\n"));
    setNotes(meal.notes);
  }

  const save = () => {
    onSave({
      ...meal,
      title: title.trim(),
      description: description.trim(),
      ingredients: ingredients
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      notes: notes.trim(),
      updated_by: meal.updated_by,
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      wide
      title={`${MEAL_LABEL[meal.meal_type]} — modifier`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={save}>Enregistrer</Button>
        </>
      }
    >
      <div className="space-y-3">
        <div>
          <label className="text-xs font-medium text-muted">Nom du plat</label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex : Pâtes à la tomate" className="mt-1" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted">Description</label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Préparation, accompagnements…"
            className="mt-1"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted">Ingrédients (un par ligne)</label>
          <Textarea
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            placeholder={"Pâtes\nSauce tomate\nParmesan"}
            className="mt-1 min-h-[100px]"
          />
          <p className="text-xs text-faint mt-1">Ces ingrédients alimenteront la liste d'épicerie.</p>
        </div>
        <div>
          <label className="text-xs font-medium text-muted">Notes / alertes</label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Allergies, substitutions, choses à surveiller…"
            className="mt-1"
          />
        </div>
      </div>
    </Modal>
  );
}
