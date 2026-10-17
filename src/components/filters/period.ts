import { format, isSameDay, parseISO, startOfToday, subDays } from "date-fns";

export type Period = { from?: string; to?: string };

const iso = (date: Date) => format(date, "yyyy-MM-dd");

const lastDays = (fromDaysAgo: number, toDaysAgo = 0): Period => {
  const today = startOfToday();
  return {
    from: iso(subDays(today, fromDaysAgo)),
    to: iso(subDays(today, toDaysAgo)),
  };
};

export const periodPresets = [
  { key: "all", label: "За все время", range: (): Period => ({}) },
  { key: "today", label: "За сегодня", range: () => lastDays(0) },
  { key: "yesterday", label: "За вчера", range: () => lastDays(1, 1) },
  { key: "week", label: "За 7 дней", range: () => lastDays(6) },
  { key: "month", label: "За 30 дней", range: () => lastDays(29) },
];

const sameDay = (a?: string, b?: string) =>
  a === b || (!!a && !!b && isSameDay(parseISO(a), parseISO(b)));

export const presetOf = (period: Period) =>
  periodPresets.find((preset) => {
    const range = preset.range();
    return sameDay(range.from, period.from) && sameDay(range.to, period.to);
  });

const display = (day: string) => format(parseISO(day), "dd.MM.yyyy");

export function periodLabel(period: Period) {
  const preset = presetOf(period);
  if (preset) return preset.label;
  const from = period.from ? display(period.from) : "…";
  const to = period.to ? display(period.to) : "…";
  return from === to ? from : `${from} – ${to}`;
}
