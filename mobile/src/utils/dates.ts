export function daysBetween(from: string, to: string): number {
  if (!from || !to) return 0;
  const start = new Date(`${from}T00:00:00`);
  const end = new Date(`${to}T00:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) return 0;
  return Math.floor((end.getTime() - start.getTime()) / 86400000) + 1;
}
export function formatShortDate(value: string | null | undefined): string {
  if (!value) return '–';
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(new Date(`${value}T12:00:00`));
}
export function formatMonthYear(value: string | null | undefined): string {
  if (!value) return '–';
  return new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' }).format(new Date(`${value}T12:00:00`));
}
export function formatFullDate(value: string | null | undefined): string {
  if (!value) return '–';
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(`${value}T12:00:00`));
}
export function formatMoney(amount: number, currency = 'THB'): string {
  return new Intl.NumberFormat('en-TH', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
}
export function toDateStr(date: Date | string): string {
  const d = date instanceof Date ? date : new Date(date);
  const y = d.getFullYear(); const m = String(d.getMonth() + 1).padStart(2, '0'); const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
export function addDays(dateStr: string, n: number): string {
  const d = new Date(`${dateStr}T12:00:00`); d.setDate(d.getDate() + n); return toDateStr(d);
}
export const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
export const DAY_ABBRS = ['Mo','Tu','We','Th','Fr','Sa','Su'];
export function calendarWeeks(year: number, month: number): (number | null)[][] {
  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = (firstDow + 6) % 7;
  const cells: (number | null)[] = [...Array(startOffset).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) { const week = cells.slice(i, i + 7); while (week.length < 7) week.push(null); weeks.push(week); }
  return weeks;
}
export function todayStr(): string { return toDateStr(new Date()); }
