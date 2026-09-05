"use client";
import { useState } from "react";
import type { Child } from "@/lib/types";
import { Button, EmptyState, Input, Modal, Textarea } from "@/components/ui";
import { Plus, Pencil, Trash2, Baby, AlertTriangle } from "lucide-react";

export function ChildrenView({
  children,
  currentMemberName,
  onSave,
  onDelete,
}: {
  children: Child[];
  currentMemberName: string;
  onSave: (child: Child) => void;
  onDelete: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Child | null>(null);

  const startAdd = () => {
    setEditing({ id: "", household_id: "", name: "", allergies: "", dislikes: "", notes: "" });
    setOpen(true);
  };
  const startEdit = (c: Child) => {
    setEditing({ ...c });
    setOpen(true);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="font-display font-bold text-lg">Profils des enfants</h2>
          <p className="text-xs text-faint">Allergies, préférences et infos utiles pour planifier les repas.</p>
        </div>
        <Button size="sm" onClick={startAdd}>
          <Plus size={14} /> Ajouter
        </Button>
      </div>

      {children.length === 0 ? (
        <EmptyState
          icon={<Baby size={28} />}
          title="Aucun enfant"
          hint="Ajoute les enfants gardés pour suivre leurs allergies et préférences."
        />
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {children.map((c) => (
            <div key={c.id} className="rounded-lg border border-border bg-surface p-3 group">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-sm flex items-center gap-1.5">
                  <Baby size={16} className="text-primary" /> {c.name}
                </h3>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                  <button onClick={() => startEdit(c)} className="p-1 text-faint hover:text-primary rounded" aria-label="Modifier">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => onDelete(c.id)} className="p-1 text-faint hover:text-danger rounded" aria-label="Supprimer">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              {c.allergies && (
                <p className="text-xs text-danger flex items-center gap-1 mb-1">
                  <AlertTriangle size={11} /> Allergies : {c.allergies}
                </p>
              )}
              {c.dislikes && <p className="text-xs text-muted">N'aime pas : {c.dislikes}</p>}
              {c.notes && <p className="text-xs text-faint mt-1">{c.notes}</p>}
            </div>
          ))}
        </div>
      )}

      <ChildDialog
        open={open}
        editing={editing}
        onClose={() => setOpen(false)}
        onSave={(c) => {
          onSave(c);
          setOpen(false);
        }}
      />
    </div>
  );
}

function ChildDialog({
  open,
  editing,
  onClose,
  onSave,
}: {
  open: boolean;
  editing: Child | null;
  onClose: () => void;
  onSave: (c: Child) => void;
}) {
  const [name, setName] = useState("");
  const [allergies, setAllergies] = useState("");
  const [dislikes, setDislikes] = useState("");
  const [notes, setNotes] = useState("");

  // sync au changement d'enfant édité
  const [lastId, setLastId] = useState<string | null>(null);
  if (editing && editing.id !== lastId) {
    setLastId(editing.id);
    setName(editing.name);
    setAllergies(editing.allergies);
    setDislikes(editing.dislikes);
    setNotes(editing.notes);
  }
  if (!editing && lastId !== null) setLastId(null);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing?.id ? "Modifier l'enfant" : "Nouvel enfant"}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button
            onClick={() =>
              onSave({
                id: editing?.id || crypto.randomUUID(),
                household_id: editing?.household_id || "",
                name: name.trim() || "Sans nom",
                allergies: allergies.trim(),
                dislikes: dislikes.trim(),
                notes: notes.trim(),
              })
            }
          >
            Enregistrer
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <div>
          <label className="text-xs font-medium text-muted">Prénom</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Léo" className="mt-1" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted">Allergies / restrictions</label>
          <Input value={allergies} onChange={(e) => setAllergies(e.target.value)} placeholder="Arachides, lactose…" className="mt-1" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted">N'aime pas</label>
          <Input value={dislikes} onChange={(e) => setDislikes(e.target.value)} placeholder="Brocoli, poisson…" className="mt-1" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted">Notes</label>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Préférences, routines, infos utiles…" className="mt-1" />
        </div>
      </div>
    </Modal>
  );
}
