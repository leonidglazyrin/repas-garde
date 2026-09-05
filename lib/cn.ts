// Petite utilité de fusion de classes (pas de dépendance externe)
export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}
