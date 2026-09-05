"use client";
import { useMemo, useState } from "react";
import type { GroceryItem } from "@/lib/types";
import { GROCERY_CATEGORIES } from "@/lib/types";
import { Button, Checkbox, EmptyState, Input, Select } from "@/components/ui";
import { Plus, Trash2, ShoppingCart, Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/cn";

export function GroceryView({
  items,
  currentRole,
  currentMemberName,
  onAdd,
  onUpdate,
  onDelete,
  onToggle,
}: {
  items: GroceryItem[];
  currentRole: "gardienne" | "parent";
  currentMemberName: string;
  onAdd: (item: GroceryItem) => void;
  onUpdate: (item: GroceryItem) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string, checked: boolean) => void;
}) {
  const [newName, setNewName] = useState("");
  const [newCat, setNewCat] = useState("Divers");
  const [newQty, setNewQty] = useState("");
  const [filter, setFilter] = useState<"all" | "todo" | "done">("all");

  const filtered = useMemo(() => {
    if (filter === "todo") return items.filter((i) => !i.checked);
    if (filter === "done") return items.filter((i) => i.checked);
    return items;
  }, [items, filter]);

  const grouped = useMemo(() => {
    const m = new Map<string, GroceryItem[]>();
    for (const it of filtered) {
      const c = it.category || "Divers";
      if (!m.has(c)) m.set(c, []);
      m.get(c)!.push(it);
    }
    return GROCERY_CATEGORIES.filter((c) => m.has(c)).map((c) => ({ category: c, list: m.get(c)! }));
  }, [filtered]);

  const doneCount = items.filter((i) => i.checked).length;
  const progress = items.length ? Math.round((doneCount / items.length) * 100) : 0;

  const add = () => {
    if (!newName.trim()) return;
    onAdd({
      id: crypto.randomUUID(),
      week_id: items[0]?.week_id ?? "",
      name: newName.trim(),
      category: newCat,
      quantity: newQty.trim(),
      checked: false,
      updated_by: currentMemberName,
    });
    setNewName("");
    setNewQty("");
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="font-display font-bold text-lg">Liste d'épicerie</h2>
          <p className="text-xs text-faint">{doneCount}/{items.length} articles · {progress}%</p>
        </div>
        <div className="flex gap-1 text-xs">
          {(["all", "todo", "done"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-2.5 py-1 rounded-md",
                filter === f ? "bg-primary-soft text-primary font-medium" : "text-muted hover:bg-offset",
              )}
            >
              {f === "all" ? "Tout" : f === "todo" ? "À acheter" : "Fait"}
            </button>
          ))}
        </div>
      </div>

      {items.length > 0 && (
        <div className="h-1.5 bg-offset rounded-full mb-4 overflow-hidden">
          <div className="h-full bg-success transition-all" style={{ width: `${progress}%` }} />
        </div>
      )}

      {/* Ajout rapide */}
      <div className="flex flex-wrap items-center gap-2 mb-4 p-2 bg-surface border border-border rounded-lg">
        <Input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="Ajouter un article…"
          className="flex-1 min-w-[140px]"
        />
        <Select value={newCat} onChange={(e) => setNewCat(e.target.value)} className="w-auto min-w-[140px]">
          {GROCERY_CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </Select>
        <Input
          value={newQty}
          onChange={(e) => setNewQty(e.target.value)}
          placeholder="Qté"
          className="w-20"
        />
        <Button size="sm" onClick={add}>
          <Plus size={14} />
        </Button>
      </div>

      {grouped.length === 0 ? (
        <EmptyState
          icon={<ShoppingCart size={28} />}
          title="Liste vide"
          hint="Génère la liste depuis les repas de la semaine, ou ajoute des articles manuellement."
        />
      ) : (
        <div className="space-y-4">
          {grouped.map(({ category, list }) => (
            <div key={category}>
              <h3 className="text-xs font-semibold text-muted uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                <Sparkles size={12} /> {category}
              </h3>
              <div className="space-y-1">
                {list.map((item) => (
                  <GroceryRow
                    key={item.id}
                    item={item}
                    currentRole={currentRole}
                    currentMemberName={currentMemberName}
                    onToggle={(v) => onToggle(item.id, v)}
                    onUpdate={(patch) => onUpdate({ ...item, ...patch })}
                    onDelete={() => onDelete(item.id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function GroceryRow({
  item,
  currentRole,
  currentMemberName,
  onToggle,
  onUpdate,
  onDelete,
}: {
  item: GroceryItem;
  currentRole: "gardienne" | "parent";
  currentMemberName: string;
  onToggle: (v: boolean) => void;
  onUpdate: (patch: Partial<GroceryItem>) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(item.name);
  const [qty, setQty] = useState(item.quantity);

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-md px-2 py-1.5 group transition",
        item.checked ? "bg-offset opacity-60" : "hover:bg-offset",
      )}
    >
      <Checkbox checked={item.checked} onChange={onToggle} />
      {editing ? (
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => {
            onUpdate({ name: name.trim() || item.name, quantity: qty, updated_by: currentMemberName });
            setEditing(false);
          }}
          autoFocus
          className="flex-1 text-sm bg-transparent border-b border-border outline-none"
        />
      ) : (
        <button
          onClick={() => setEditing(true)}
          className={cn("flex-1 text-left text-sm", item.checked && "line-through")}
        >
          {item.name}
          {item.quantity && <span className="text-faint"> · {item.quantity}</span>}
        </button>
      )}
      <span className="text-xs text-faint opacity-0 group-hover:opacity-100 transition hidden sm:inline">
        {item.updated_by ? `par ${item.updated_by}` : ""}
      </span>
      {currentRole === "gardienne" && (
        <button
          onClick={onDelete}
          className="text-faint hover:text-danger p-1 opacity-0 group-hover:opacity-100 transition"
          aria-label="Supprimer"
        >
          <Trash2 size={14} />
        </button>
      )}
    </div>
  );
}
