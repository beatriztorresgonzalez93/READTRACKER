// Cálculos puros del historial (agrupaciones, rachas, top días e intensidad por rango).
import { HistoryEvent } from "./types";
import { getDayKey } from "./historyUtils";

const ONE_DAY_MS = 86400000;

export const computeStreakStatsFromDays = (days: number[], today = new Date()) => {
  if (days.length === 0) return { currentStreakDays: 0, longestStreakDays: 0 };

  let longestStreakDays = 1;
  let currentRun = 1;
  for (let i = 1; i < days.length; i += 1) {
    const deltaDays = Math.round((days[i] - days[i - 1]) / ONE_DAY_MS);
    currentRun = deltaDays === 1 ? currentRun + 1 : 1;
    longestStreakDays = Math.max(longestStreakDays, currentRun);
  }

  const todayDayMs = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  let currentStreakDays = 0;
  const lastIndex = days.length - 1;
  if (days[lastIndex] === todayDayMs) {
    currentStreakDays = 1;
    for (let i = lastIndex; i > 0; i -= 1) {
      const deltaDays = Math.round((days[i] - days[i - 1]) / ONE_DAY_MS);
      if (deltaDays !== 1) break;
      currentStreakDays += 1;
    }
  }

  return { currentStreakDays, longestStreakDays };
};

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
  const todayKey = getDayKey(today);
  const dayMs = uniqueDays
    .filter((dayKey) => dayKey <= todayKey)
    .map((dayKey) => new Date(`${dayKey}T00:00:00`).getTime());
  return computeStreakStatsFromDays(dayMs, today).currentStreakDays;
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
