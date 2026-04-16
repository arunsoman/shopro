import { useState } from "react";
import { format, parseISO, addWeeks, startOfWeek, addDays, isSameWeek } from "date-fns";

function currentWeekStart(): string {
  return format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");
}

function buildLabel(ws: string): string {
  const d = parseISO(ws);
  return `${format(d, "MMM d")} – ${format(addDays(d, 6), "MMM d, yyyy")}`;
}

export function useWeekNav(initial?: string) {
  const [weekStart, setWeekStart] = useState<string>(initial ?? currentWeekStart());

  const prev = () => setWeekStart(w => format(addWeeks(parseISO(w), -1), "yyyy-MM-dd"));
  const next = () => setWeekStart(w => format(addWeeks(parseISO(w), 1), "yyyy-MM-dd"));

  const isCurrentWeek = isSameWeek(parseISO(weekStart), new Date(), { weekStartsOn: 1 });

  return {
    weekStart,
    setWeekStart,
    label: buildLabel(weekStart),
    prev,
    next,
    isCurrentWeek,
  };
}
