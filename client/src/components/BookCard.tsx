// Tarjeta visual de un libro con portada, estado, progreso y acceso a detalle.
import { KeyboardEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Book } from "../types/book";

interface BookCardProps {
  book: Book;
  index?: number;
  isDeleting?: boolean;
  onDelete?: (id: string) => void | Promise<void>;
}

export const BookCard = ({ book, index = 0, isDeleting = false, onDelete }: BookCardProps) => {
  const navigate = useNavigate();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [coverBroken, setCoverBroken] = useState(false);

  useEffect(() => {
    setCoverBroken(false);
  }, [book.coverUrl, book.id]);
  const statusStyles: Record<Book["status"], string> = {
    pendiente: "bg-amber-100 text-amber-700",
    leyendo: "bg-indigo-100 text-indigo-700",
    leido: "bg-emerald-100 text-emerald-700"
  };
  const progress = Math.max(0, Math.min(100, book.progress ?? 0));
  const goToDetails = () => {
    if (confirmDelete) {
      setConfirmDelete(false);
      return;
    }
    navigate(`/books/${book.id}`);
  };
  const handleCardKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    goToDetails();
  };

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={goToDetails}
      onKeyDown={handleCardKeyDown}
      aria-label={`Ver detalle de ${book.title}`}
      className="group animate-fade-in-up min-h-[430px] w-full max-w-xs rounded-2xl border border-indigo-100/80 bg-gradient-to-b from-white to-indigo-50/40 p-4 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-indigo-900/40 dark:from-slate-900 dark:to-indigo-950/20"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      {book.coverUrl && !coverBroken ? (
        <div className="mb-3 mx-auto h-44 w-32 overflow-hidden rounded-xl ring-1 ring-slate-200 dark:ring-slate-700">
          <img
            src={book.coverUrl}
            alt={`Portada de ${book.title}`}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            onError={() => setCoverBroken(true)}
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
      <div className="mt-2 space-y-2" onClick={(event) => event.stopPropagation()}>
        {confirmDelete ? (
          <div
            role="dialog"
            aria-labelledby={`delete-confirm-${book.id}`}
            className="rounded-lg border border-rose-200 bg-rose-50/90 p-3 dark:border-rose-900/50 dark:bg-rose-950/50"
          >
            <p id={`delete-confirm-${book.id}`} className="mb-3 text-sm font-medium text-rose-900 dark:text-rose-100">
              ¿Eliminar este libro de la biblioteca?
            </p>
            <div className="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                disabled={isDeleting}
                className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => void onDelete?.(book.id)}
                disabled={isDeleting}
                className="rounded-md bg-rose-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isDeleting ? "Eliminando..." : "Sí, eliminar"}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              onKeyDown={(event) => event.stopPropagation()}
              disabled={isDeleting}
              className="rounded-md border border-rose-200 bg-rose-50 px-3 py-1.5 text-sm font-medium text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-900/40"
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </button>
            <Link
              to={`/books/${book.id}/edit`}
              onClick={(event) => event.stopPropagation()}
              onKeyDown={(event) => event.stopPropagation()}
              className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-indigo-500"
            >
              Editar
            </Link>
          </div>
        )}
      </div>
    </article>
  );
};
