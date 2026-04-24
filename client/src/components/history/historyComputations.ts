// Cálculos puros del historial (agrupaciones, rachas, top días e intensidad por rango).
import { HistoryEvent } from "./types";
import { getDayKey } from "./historyUtils";

export const buildMonthEventsByDay = (events: HistoryEvent[]) => {
  const map = new Map<string, HistoryEvent[]>();
  events.forEach((event) => {
    const current = map.get(event.dayKey) ?? [];
    current.push(event);
    map.set(event.dayKey, current);
  });
  map.forEach((list, key) => {
    map.set(key, list.sort((a, b) => b.at.getTime() - a.at.getTime()));
  });
  return map;
};

export const computeCurrentStreak = (events: HistoryEvent[], today = new Date()) => {
  const uniqueDays = Array.from(new Set(events.map((event) => event.dayKey))).sort();
  if (uniqueDays.length === 0) return 0;
  const lastDay = uniqueDays[uniqueDays.length - 1];
  if (lastDay !== getDayKey(today)) return 0;
  let streak = 1;
  for (let i = uniqueDays.length - 1; i > 0; i -= 1) {
    const prev = new Date(`${uniqueDays[i - 1]}T00:00:00`).getTime();
    const current = new Date(`${uniqueDays[i]}T00:00:00`).getTime();
    if (Math.round((current - prev) / 86400000) !== 1) break;
    streak += 1;
  }
  return streak;
};

export const computeBestDays = (events: HistoryEvent[], limit = 5) => {
  const grouped = new Map<string, number>();
  events.forEach((event) => {
    grouped.set(event.dayKey, (grouped.get(event.dayKey) ?? 0) + (event.pagesRead ?? 0));
  });
  return Array.from(grouped.entries())
    .map(([dayKey, pages]) => ({ dayKey, pages }))
    .sort((a, b) => b.pages - a.pages || b.dayKey.localeCompare(a.dayKey))
    .slice(0, limit);
};

export const computeIntensityBuckets = (monthEventsByDay: Map<string, HistoryEvent[]>) => {
  const counts = [0, 0, 0, 0, 0, 0];
  monthEventsByDay.forEach((events) => {
    const pages = events.reduce((sum, event) => sum + (event.pagesRead ?? 0), 0);
    if (pages <= 0) counts[0] += 1;
    else if (pages <= 10) counts[1] += 1;
    else if (pages <= 25) counts[2] += 1;
    else if (pages <= 40) counts[3] += 1;
    else if (pages <= 60) counts[4] += 1;
    else counts[5] += 1;
  });
  return counts;
};
