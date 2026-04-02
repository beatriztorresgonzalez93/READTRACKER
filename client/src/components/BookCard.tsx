// Tarjeta visual de un libro con portada, estado, progreso y acceso a detalle.
import { Link } from "react-router-dom";
import { Book } from "../types/book";

interface BookCardProps {
  book: Book;
  index?: number;
}

export const BookCard = ({ book, index = 0 }: BookCardProps) => {
  const statusStyles: Record<Book["status"], string> = {
    pendiente: "bg-amber-100 text-amber-700",
    leyendo: "bg-indigo-100 text-indigo-700",
    leido: "bg-emerald-100 text-emerald-700"
  };
  const progress = Math.max(0, Math.min(100, book.progress ?? 0));

  return (
    <Link
      to={`/books/${book.id}`}
      aria-label={`Ver detalle de ${book.title}`}
      className="group animate-fade-in-up min-h-[430px] w-full max-w-xs rounded-2xl border border-indigo-100/80 bg-gradient-to-b from-white to-indigo-50/40 p-4 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-indigo-900/40 dark:from-slate-900 dark:to-indigo-950/20"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      {book.coverUrl ? (
        <div className="mb-3 mx-auto h-44 w-32 overflow-hidden rounded-xl ring-1 ring-slate-200 dark:ring-slate-700">
          <img
            src={book.coverUrl}
            alt={`Portada de ${book.title}`}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        </div>
      ) : (
        <div className="mb-3 mx-auto flex h-44 w-32 items-center justify-center rounded-xl bg-gradient-to-b from-indigo-100 to-indigo-200 text-center text-xs font-semibold text-indigo-700 ring-1 ring-indigo-200 dark:from-indigo-900/40 dark:to-indigo-800/40 dark:text-indigo-300 dark:ring-indigo-900/40">
          Sin portada
        </div>
      )}
      <div className="mb-3 flex items-start justify-between gap-2">
        <h3 className="line-clamp-2 text-lg font-semibold text-slate-900 dark:text-slate-100">{book.title}</h3>
        <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusStyles[book.status]}`}>
          {book.status}
        </span>
      </div>
      <p className="text-sm text-slate-600 dark:text-slate-300">Autor: {book.author}</p>
      <p className="text-sm text-slate-600 dark:text-slate-300">Género: {book.genre}</p>
      <p className="text-sm text-slate-600 dark:text-slate-300">Calificación: {book.rating ?? "-"}</p>
      <p className="mb-1 text-sm text-slate-600 dark:text-slate-300">Progreso: {progress}%</p>
      <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </Link>
  );
};
