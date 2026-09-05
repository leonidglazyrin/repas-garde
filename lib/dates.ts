// Helpers de dates (semaine commence lundi, format FR-CA)

export function startOfWeek(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  const day = x.getDay(); // 0 dim ... 6 sam
  const diff = day === 0 ? -6 : 1 - day;
  x.setDate(x.getDate() + diff);
  return x;
}

export function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

export function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function parseISO(s: string): Date {
  const [y, m, dd] = s.split("-").map(Number);
  return new Date(y, m - 1, dd);
}

const DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const DAYS_FULL = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
const MONTHS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];

export function dayShort(i: number) {
  return DAYS[i];
}
export function dayFull(i: number) {
  return DAYS_FULL[i];
}
export function formatDate(d: Date): string {
  return `${DAYS_FULL[d.getDay() === 0 ? 6 : d.getDay() - 1]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}
export function formatWeekRange(weekStart: string): string {
  const s = parseISO(weekStart);
  const e = addDays(s, 6);
  return `${s.getDate()} ${MONTHS[s.getMonth()]} – ${e.getDate()} ${MONTHS[e.getMonth()]} ${e.getFullYear()}`;
}
