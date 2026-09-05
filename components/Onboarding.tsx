"use client";
import { useState } from "react";
import { createHousehold, joinHousehold } from "@/lib/db";
import { IS_DEMO } from "@/lib/supabase";
import { Button, Input, Select } from "@/components/ui";
import { UtensilsCrossed, Heart } from "lucide-react";

export function Onboarding({
  onReady,
}: {
  onReady: (householdId: string, memberId: string, memberName: string, role: "gardienne" | "parent") => void;
}) {
  const [mode, setMode] = useState<"create" | "join">("create");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"gardienne" | "parent">("gardienne");
  const [householdName, setHouseholdName] = useState("");
  const [code, setCode] = useState("");
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
      if (mode === "create") {
        if (!householdName.trim()) {
          setError("Donne un nom au foyer.");
          setLoading(false);
          return;
        }
        const { household, member } = await createHousehold(householdName.trim());
        onReady(household.id, member.id, member.name, role);
      } else {
        if (!code.trim()) {
          setError("Entre le code d'invitation.");
          setLoading(false);
          return;
        }
        const res = await joinHousehold(code.trim().toUpperCase(), name.trim(), role);
        if (!res) {
          setError("Code d'invitation introuvable. Vérifie-le avec la gardienne.");
          setLoading(false);
          return;
        }
        onReady(res.household.id, res.member.id, res.member.name, role);
      }
    } catch (e) {
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
            Planifie les repas de la semaine, fais-les valider par les parents, puis génère la liste d'épicerie.
          </p>
        </div>

        <div className="bg-surface border border-border rounded-xl p-5 shadow-sm">
          <div className="grid grid-cols-2 gap-1 p-1 bg-offset rounded-lg mb-4">
            <button
              onClick={() => setMode("create")}
              className={`text-sm font-medium py-2 rounded-md transition ${mode === "create" ? "bg-surface shadow-sm text-text" : "text-muted"}`}
            >
              Créer un foyer
            </button>
            <button
              onClick={() => setMode("join")}
              className={`text-sm font-medium py-2 rounded-md transition ${mode === "join" ? "bg-surface shadow-sm text-text" : "text-muted"}`}
            >
              Rejoindre (code)
            </button>
          </div>

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

            {mode === "create" ? (
              <div>
                <label className="text-xs font-medium text-muted">Nom du foyer</label>
                <Input
                  value={householdName}
                  onChange={(e) => setHouseholdName(e.target.value)}
                  placeholder="Garde de Léo & Mia"
                  className="mt-1"
                />
              </div>
            ) : (
              <div>
                <label className="text-xs font-medium text-muted">Code d'invitation</label>
                <Input
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="ABC123"
                  className="mt-1 uppercase tracking-widest text-center"
                  maxLength={6}
                />
                <p className="text-xs text-faint mt-1">Demandé par la gardienne.</p>
              </div>
            )}

            {error && <p className="text-sm text-danger">{error}</p>}

            <Button onClick={submit} disabled={loading} className="w-full">
              {loading ? "Chargement…" : mode === "create" ? "Créer le foyer" : "Rejoindre"}
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
