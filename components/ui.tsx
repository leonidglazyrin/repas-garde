"use client";
import { cn } from "@/lib/cn";
import { X } from "lucide-react";
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";
import { useEffect } from "react";

export function cnHelper(...c: (string | undefined | false)[]) {
  return c.filter(Boolean).join(" ");
}

type Variant = "primary" | "ghost" | "outline" | "danger" | "soft";
const variants: Record<Variant, string> = {
  primary: "bg-primary text-white hover:bg-primary-hover",
  ghost: "text-muted hover:bg-offset hover:text-text",
  outline: "border border-border text-text hover:bg-offset",
  danger: "bg-danger text-white hover:brightness-110",
  soft: "bg-primary-soft text-primary hover:brightness-95",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: "sm" | "md" }) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none",
        size === "sm" ? "text-sm px-2.5 py-1.5" : "text-sm px-4 py-2",
        variants[variant],
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

export function Badge({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium", className)}>
      {children}
    </span>
  );
}

export function Input({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition",
        className,
      )}
      {...rest}
    />
  );
}

export function Textarea({ className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition resize-y min-h-[80px]",
        className,
      )}
      {...rest}
    />
  );
}

export function Select({ className, children, ...rest }: InputHTMLAttributes<HTMLSelectElement> & { children: ReactNode }) {
  return (
    <select
      className={cn(
        "w-full rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition",
        className,
      )}
      {...(rest as object)}
    >
      {children}
    </select>
  );
}

export function Checkbox({ checked, onChange, label, className }: { checked: boolean; onChange: (v: boolean) => void; label?: string; className?: string }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn("inline-flex items-center gap-2 group", className)}
      aria-pressed={checked}
    >
      <span
        className={cn(
          "h-5 w-5 shrink-0 rounded-md border-2 flex items-center justify-center transition",
          checked ? "bg-success border-success" : "border-border group-hover:border-primary bg-surface",
        )}
      >
        {checked && (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4">
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      {label && <span className="text-sm">{label}</span>}
    </button>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div
        className={cn(
          "relative bg-surface border border-border rounded-t-xl sm:rounded-xl shadow-lg w-full animate-pop",
          wide ? "sm:max-w-2xl" : "sm:max-w-md",
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-divider">
          <h3 className="font-display font-bold text-lg">{title}</h3>
          <button onClick={onClose} className="text-faint hover:text-text p-1 rounded-md" aria-label="Fermer">
            <X size={20} />
          </button>
        </div>
        <div className="p-4 max-h-[70vh] overflow-y-auto thin-scroll">{children}</div>
        {footer && <div className="flex justify-end gap-2 p-4 border-t border-divider">{footer}</div>}
      </div>
    </div>
  );
}

export function EmptyState({ icon, title, hint }: { icon: ReactNode; title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-4">
      <div className="text-faint mb-3">{icon}</div>
      <p className="font-medium text-text">{title}</p>
      {hint && <p className="text-sm text-muted mt-1 max-w-xs">{hint}</p>}
    </div>
  );
}

export function Spinner() {
  return (
    <div className="flex items-center justify-center py-10">
      <div className="h-6 w-6 border-2 border-border border-t-primary rounded-full animate-spin" />
    </div>
  );
}
