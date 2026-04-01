// Select reutilizable para filtrar la biblioteca por estado de lectura.
import { ReadingStatus } from "../types/book";

interface StatusFilterProps {
  value: ReadingStatus | "todos";
  onChange: (status: ReadingStatus | "todos") => void;
}

export const StatusFilter = ({ value, onChange }: StatusFilterProps) => {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value as ReadingStatus | "todos")}
      className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm ring-1 ring-transparent transition focus:border-slate-300 focus:outline-none focus:ring-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-slate-600 dark:focus:ring-slate-600"
    >
      <option value="todos">Todos</option>
      <option value="pendiente">Pendiente</option>
      <option value="leyendo">Leyendo</option>
      <option value="leido">Leído</option>
    </select>
  );
};
