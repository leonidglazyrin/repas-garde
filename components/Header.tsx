"use client";
import { Button } from "@/components/ui";
import { Moon, Sun, UtensilsCrossed } from "lucide-react";

export function Header({
  memberName,
  memberRole,
  theme,
  onToggleTheme,
}: {
  memberName: string;
  memberRole: "gardienne" | "parent";
  theme: "light" | "dark";
  onToggleTheme: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface/85 backdrop-blur">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 h-14 flex items-center gap-2">
        <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
          <UtensilsCrossed size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-display font-bold text-sm sm:text-base leading-tight truncate">Repas Garde</p>
          <p className="text-xs text-faint leading-tight">
            {memberName} · {memberRole === "gardienne" ? "Gardienne" : "Parent"}
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={onToggleTheme} aria-label="Changer de thème">
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </Button>
      </div>
    </header>
  );
}
