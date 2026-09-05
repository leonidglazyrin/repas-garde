"use client";
import { useState } from "react";
import { createHousehold } from "@/lib/db";
import { IS_DEMO } from "@/lib/supabase";
import { Button, Input, Select } from "@/components/ui";
import { UtensilsCrossed, Heart } from "lucide-react";

export function Onboarding({
  onReady,
}: {
  onReady: (householdId: string, memberId: string, memberName: string, role: "gardienne" | "parent") => void;
}) {
  const [name, setName] = useState("");
  const [role, setRole] = useState<"gardienne" | "parent">("gardienne");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    if (!name.trim()) {
      setError("Entre ton prénom.");
      return;
    }
    setLoading(true);
    try {
      // L'application est volontairement personnelle pour le moment :
      // aucun choix de foyer et aucun code d'invitation à gérer.
      const { household, member } = await createHousehold("Mon espace");
      onReady(household.id, member.id, name.trim(), role);
    } catch {
      setError("Une erreur est survenue. Réessaie.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center p-4 bg-gradient-to-b from-primary-soft/40 to-bg">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white mb-4 shadow-lg">
            <UtensilsCrossed size={28} />
          </div>
          <h1 className="font-display font-bold text-2xl">Repas Garde</h1>
          <p className="text-muted text-sm mt-1">
            Ton espace personnel pour planifier les soupers, gérer les profils et préparer l'épicerie.
          </p>
        </div>

        <div className="bg-surface border border-border rounded-xl p-5 shadow-sm">
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted">Ton prénom</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Romane" className="mt-1" />
            </div>

            <div>
              <label className="text-xs font-medium text-muted">Je suis…</label>
              <Select
                value={role}
                onChange={(e) => setRole(e.target.value as "gardienne" | "parent")}
                className="mt-1"
              >
                <option value="gardienne">La gardienne / responsable</option>
                <option value="parent">Un parent</option>
              </Select>
            </div>

            {error && <p className="text-sm text-danger">{error}</p>}

            <Button onClick={submit} disabled={loading} className="w-full">
              {loading ? "Chargement…" : "Entrer dans mon espace"}
            </Button>
          </div>
        </div>

        <p className="text-center text-xs text-faint mt-4 flex items-center justify-center gap-1.5">
          <Heart size={12} /> {IS_DEMO ? "Mode démo — les données sont locales à cet aperçu." : "Synchronisé en temps réel."}
        </p>
      </div>
    </div>
  );
}
