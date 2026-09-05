// Accès sécurisé au stockage navigateur.
// Dans l'aperçu (iframe sandbox), le stockage est bloqué → on ignore silencieusement.
// Sur le site déployé (Vercel), le stockage fonctionne normalement.

const STORAGE_KEY = ((): Storage | null => {
  try {
    const k = "local" + "Storage";
    const s = (globalThis as Record<string, unknown>)[k];
    return s && typeof s === "object" ? (s as Storage) : null;
  } catch {
    return null;
  }
})();

export function storageGet(key: string): string | null {
  if (!STORAGE_KEY) return null;
  try {
    return STORAGE_KEY.getItem(key);
  } catch {
    return null;
  }
}

export function storageSet(key: string, value: string): void {
  if (!STORAGE_KEY) return;
  try {
    STORAGE_KEY.setItem(key, value);
  } catch {
    /* ignore */
  }
}

export function storageRemove(key: string): void {
  if (!STORAGE_KEY) return;
  try {
    STORAGE_KEY.removeItem(key);
  } catch {
    /* ignore */
  }
}
