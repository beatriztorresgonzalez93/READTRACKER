// Campo de búsqueda reutilizable para filtrar libros por texto.
interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export const SearchBar = ({ value, onChange }: SearchBarProps) => {
  return (
    <input
      type="text"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder="Buscar por título, autor o género..."
      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm shadow-sm ring-1 ring-transparent transition focus:border-slate-300 focus:outline-none focus:ring-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-slate-600 dark:focus:ring-slate-600"
    />
  );
};
