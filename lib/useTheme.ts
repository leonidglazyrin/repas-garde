"use client";
import { useEffect, useState } from "react";

import { storageGet, storageSet } from "@/lib/storage";

export function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    let initial: "light" | "dark" = "light";
    const saved = storageGet("repas-garde-theme");
    if (saved === "dark" || saved === "light") initial = saved;
    else {
      try {
        if (window.matchMedia("(prefers-color-scheme: dark)").matches) initial = "dark";
      } catch {
        /* ignore */
      }
    }
    setTheme(initial);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    storageSet("repas-garde-theme", theme);
  }, [theme]);

  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));
  return { theme, toggle };
}
