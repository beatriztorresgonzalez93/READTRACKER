// Tests unitarios de utilidades de historial (fechas, celdas de calendario y colores).
import { describe, expect, it } from "vitest";
import {
  formatDayLabel,
  formatMonthLabel,
  getDayKey,
  getMonthCalendarCells,
  intensityColorByPages
} from "./historyUtils";

describe("historyUtils", () => {
  it("getDayKey devuelve fecha local en formato YYYY-MM-DD", () => {
    const date = new Date(2026, 3, 24, 18, 45);
    expect(getDayKey(date)).toBe("2026-04-24");
  });

  it("formatMonthLabel devuelve etiqueta de mes en español", () => {
    const date = new Date(2026, 3, 1);
    const label = formatMonthLabel(date);
    expect(label.toLowerCase()).toContain("abril");
    expect(label).toContain("2026");
  });

  it("formatDayLabel devuelve etiqueta corta en español", () => {
    const label = formatDayLabel("2026-04-24");
    expect(label.length).toBeGreaterThan(3);
    expect(label).toContain("24");
  });

  it("getMonthCalendarCells siempre devuelve 42 celdas", () => {
    const april = new Date(2026, 3, 1);
    const cells = getMonthCalendarCells(april);
    expect(cells).toHaveLength(42);
  });

  it("getMonthCalendarCells incluye todos los días reales del mes", () => {
    const april = new Date(2026, 3, 1); // abril tiene 30 días
    const cells = getMonthCalendarCells(april);
    const dayNumbers = cells.filter((cell): cell is Date => cell !== null).map((cell) => cell.getDate());
    expect(dayNumbers).toContain(1);
    expect(dayNumbers).toContain(30);
    expect(dayNumbers).not.toContain(31);
  });

  it("intensityColorByPages respeta todos los tramos de color", () => {
    expect(intensityColorByPages(0)).toBe("#efe3cd");
    expect(intensityColorByPages(10)).toBe("#e3cfa0");
    expect(intensityColorByPages(25)).toBe("#d6b56c");
    expect(intensityColorByPages(40)).toBe("#bf9339");
    expect(intensityColorByPages(60)).toBe("#a56f2d");
    expect(intensityColorByPages(61)).toBe("#74451d");
  });
});
