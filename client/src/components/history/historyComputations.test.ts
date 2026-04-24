// Tests unitarios de cálculos de historial: agrupación, rachas, top días e intensidad.
import { describe, expect, it } from "vitest";
import {
  buildMonthEventsByDay,
  computeBestDays,
  computeCurrentStreak,
  computeIntensityBuckets
} from "./historyComputations";
import { HistoryEvent } from "./types";

const createEvent = (overrides: Partial<HistoryEvent>): HistoryEvent => ({
  id: overrides.id ?? "e1",
  bookId: overrides.bookId ?? "b1",
  title: overrides.title ?? "Libro",
  author: overrides.author ?? "Autor",
  at: overrides.at ?? new Date("2026-04-24T10:00:00.000Z"),
  dayKey: overrides.dayKey ?? "2026-04-24",
  page: overrides.page ?? 100,
  previousPage: overrides.previousPage ?? 90,
  pagesRead: overrides.pagesRead ?? 10
});

describe("historyComputations", () => {
  it("buildMonthEventsByDay agrupa y ordena por fecha descendente", () => {
    const early = createEvent({ id: "a", at: new Date("2026-04-24T08:00:00.000Z") });
    const late = createEvent({ id: "b", at: new Date("2026-04-24T12:00:00.000Z") });
    const grouped = buildMonthEventsByDay([early, late]);
    const events = grouped.get("2026-04-24") ?? [];
    expect(events.map((event) => event.id)).toEqual(["b", "a"]);
  });

  it("computeCurrentStreak devuelve la racha hasta hoy", () => {
    const events = [
      createEvent({ dayKey: "2026-04-22", at: new Date("2026-04-22T09:00:00.000Z") }),
      createEvent({ id: "2", dayKey: "2026-04-23", at: new Date("2026-04-23T09:00:00.000Z") }),
      createEvent({ id: "3", dayKey: "2026-04-24", at: new Date("2026-04-24T09:00:00.000Z") })
    ];
    const streak = computeCurrentStreak(events, new Date("2026-04-24T14:00:00.000Z"));
    expect(streak).toBe(3);
  });

  it("computeBestDays ordena por páginas descendente", () => {
    const events = [
      createEvent({ dayKey: "2026-04-24", pagesRead: 10 }),
      createEvent({ id: "2", dayKey: "2026-04-24", pagesRead: 5 }),
      createEvent({ id: "3", dayKey: "2026-04-23", pagesRead: 30 })
    ];
    const best = computeBestDays(events, 2);
    expect(best[0]).toEqual({ dayKey: "2026-04-23", pages: 30 });
    expect(best[1]).toEqual({ dayKey: "2026-04-24", pages: 15 });
  });

  it("computeIntensityBuckets aplica los 6 tramos", () => {
    const byDay = buildMonthEventsByDay([
      createEvent({ dayKey: "2026-04-01", pagesRead: 0 }),
      createEvent({ id: "2", dayKey: "2026-04-02", pagesRead: 10 }),
      createEvent({ id: "3", dayKey: "2026-04-03", pagesRead: 25 }),
      createEvent({ id: "4", dayKey: "2026-04-04", pagesRead: 40 }),
      createEvent({ id: "5", dayKey: "2026-04-05", pagesRead: 60 }),
      createEvent({ id: "6", dayKey: "2026-04-06", pagesRead: 61 })
    ]);
    expect(computeIntensityBuckets(byDay)).toEqual([1, 1, 1, 1, 1, 1]);
  });
});
