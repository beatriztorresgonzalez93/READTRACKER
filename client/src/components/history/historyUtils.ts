// Helpers puros de formato y calendario para reutilizar lógica de historial sin acoplar UI.
export const WEEK_LABELS = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"];

export const formatDayLabel = (value: string) => {
  const date = new Date(`${value}T00:00:00`);
  return date.toLocaleDateString("es-ES", {
    weekday: "short",
    day: "numeric",
    month: "short"
  });
};

export const formatMonthLabel = (date: Date) =>
  date.toLocaleDateString("es-ES", { month: "long", year: "numeric" });

export const getDayKey = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export const getMonthCalendarCells = (monthDate: Date): Array<Date | null> => {
  const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
  const startOffset = (monthStart.getDay() + 6) % 7;
  const cells: Array<Date | null> = [];
  for (let i = 0; i < startOffset; i += 1) cells.push(null);
  for (let day = 1; day <= monthEnd.getDate(); day += 1) {
    cells.push(new Date(monthDate.getFullYear(), monthDate.getMonth(), day));
  }
  while (cells.length < 42) cells.push(null);
  return cells;
};

export const intensityColorByPages = (pages: number) => {
  if (pages <= 0) return "#efe3cd";
  if (pages <= 10) return "#e3cfa0";
  if (pages <= 25) return "#d6b56c";
  if (pages <= 40) return "#bf9339";
  if (pages <= 60) return "#a56f2d";
  return "#74451d";
};
