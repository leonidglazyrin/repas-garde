"use client";
import { Button } from "@/components/ui";
import { Copy, Check, Moon, Sun, Users, UtensilsCrossed } from "lucide-react";
import { useState } from "react";

export function Header({
  householdName,
  inviteCode,
  memberName,
  memberRole,
  theme,
  onToggleTheme,
  onOpenMembers,
  childrenCount,
}: {
  householdName: string;
  inviteCode: string;
  memberName: string;
  memberRole: "gardienne" | "parent";
  theme: "light" | "dark";
  onToggleTheme: () => void;
  onOpenMembers: () => void;
  childrenCount: number;
}) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface/85 backdrop-blur">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 h-14 flex items-center gap-2">
        <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
          <UtensilsCrossed size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-display font-bold text-sm sm:text-base leading-tight truncate">{householdName}</p>
          <p className="text-xs text-faint leading-tight">
            {memberName} · {memberRole === "gardienne" ? "Gardienne" : "Parent"} · {childrenCount} enfant(s)
          </p>
        </div>

        <button
          onClick={copy}
          className="hidden sm:inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs hover:bg-offset transition"
          title="Partager ce code aux parents"
        >
          {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
          <span className="font-mono tracking-widest">{inviteCode}</span>
        </button>

        <Button variant="ghost" size="sm" onClick={onOpenMembers} aria-label="Membres">
          <Users size={18} />
        </Button>
        <Button variant="ghost" size="sm" onClick={onToggleTheme} aria-label="Changer de thème">
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </Button>
      </div>
      <div className="sm:hidden px-3 pb-2">
        <button
          onClick={copy}
          className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-xs hover:bg-offset"
        >
          {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
          Code : <span className="font-mono tracking-widest">{inviteCode}</span>
        </button>
      </div>
    </header>
  );
}
