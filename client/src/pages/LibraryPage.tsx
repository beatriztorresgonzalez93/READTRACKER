// Página principal con listado, búsqueda y filtros de la biblioteca.
import { Link } from "react-router-dom";
import { BookList } from "../components/BookList";
import { SearchBar } from "../components/SearchBar";
import { StatusFilter } from "../components/StatusFilter";
import { useBooksContext } from "../context/BooksContext";
import { useBookFilters } from "../hooks/useBookFilters";

export const LibraryPage = () => {
  const { books, loading, error } = useBooksContext();
  const { search, setSearch, status, setStatus, sortBy, setSortBy, filteredBooks } = useBookFilters(books);

  return (
    <section className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-white to-indigo-50/50 p-6 shadow-sm ring-1 ring-indigo-100 dark:from-slate-900 dark:to-indigo-950/20 dark:ring-indigo-900/40">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Panel de lectura</p>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Mi biblioteca</h1>
          </div>
          <Link
            to="/books/new"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500"
          >
            Añadir libro
          </Link>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_220px_220px]">
          <SearchBar value={search} onChange={setSearch} />
          <StatusFilter value={status} onChange={setStatus} />
          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value as typeof sortBy)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm ring-1 ring-transparent transition focus:border-slate-300 focus:outline-none focus:ring-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-slate-600 dark:focus:ring-slate-600"
          >
            <option value="recientes">Más recientes</option>
            <option value="titulo">Título (A-Z)</option>
            <option value="autor">Autor (A-Z)</option>
            <option value="genero">Género (A-Z)</option>
            <option value="valoracion">Valoración (alta-baja)</option>
          </select>
        </div>
      </div>

      {loading && <p className="text-sm text-slate-600 dark:text-slate-300">Cargando libros...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {!loading && !error && <BookList books={filteredBooks} />}
    </section>
  );
};
