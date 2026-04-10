// Tarjeta visual de un libro con portada, estado, progreso y acceso a detalle.
import { KeyboardEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
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
    pendiente:
      "rounded-full border border-yellow-300 bg-yellow-100 px-2.5 py-1 text-xs font-semibold text-yellow-800 dark:border-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-200",
    leyendo:
      "rounded-full border border-cyan-300 bg-cyan-100 px-2.5 py-1 text-xs font-semibold text-cyan-800 dark:border-cyan-700/60 dark:bg-cyan-950/40 dark:text-cyan-200",
    leido:
      "rounded-full border border-emerald-300 bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800 dark:border-emerald-700/60 dark:bg-emerald-950/40 dark:text-emerald-200"
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
      className="group animate-fade-in-up min-h-[520px] w-full max-w-xs cursor-pointer rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 dark:border-slate-800 dark:bg-slate-900"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      {book.coverUrl && !coverBroken ? (
        <div className="mb-4 h-64 w-full overflow-hidden rounded-2xl ring-1 ring-slate-200 dark:ring-slate-700">
          <img
            src={book.coverUrl}
            alt={`Portada de ${book.title}`}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            onError={() => setCoverBroken(true)}
          />
        </div>
      ) : (
        <div className="mb-4 flex h-64 w-full items-center justify-center rounded-2xl bg-gradient-to-b from-cyan-100 to-cyan-200 text-center text-sm font-semibold text-cyan-700 ring-1 ring-cyan-200 dark:from-cyan-900/40 dark:to-cyan-800/40 dark:text-cyan-300 dark:ring-cyan-900/40">
          Sin portada
        </div>
      )}
      <div className="mb-3 flex items-start justify-between gap-2">
        <h3 className="line-clamp-2 text-lg font-bold text-slate-900 dark:text-slate-100">{book.title}</h3>
        <span className={statusStyles[book.status]}>{book.status}</span>
      </div>
      <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Autor: {book.author}</p>
      <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Género: {book.genre}</p>
      <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Calificación: {book.rating ?? "-"}</p>
      <p className="mb-1 mt-2 text-sm font-semibold text-slate-800 dark:text-slate-100">Progreso: {progress}%</p>
      <div className="mb-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-teal-500"
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
              <Button
                onClick={() => setConfirmDelete(false)}
                disabled={isDeleting}
                variant="outline"
                size="sm"
              >
                Cancelar
              </Button>
              <Button
                onClick={() => void onDelete?.(book.id)}
                disabled={isDeleting}
                variant="destructive"
                size="sm"
              >
                {isDeleting ? "Eliminando..." : "Sí, eliminar"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <button
              type="button"
              aria-label={`Eliminar ${book.title}`}
              title="Eliminar"
              onClick={(event) => {
                event.stopPropagation();
                setConfirmDelete(true);
              }}
              onKeyDown={(event) => event.stopPropagation()}
              disabled={isDeleting}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition hover:bg-rose-100 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-60 dark:text-slate-400 dark:hover:bg-rose-950/50 dark:hover:text-rose-300"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
                <path
                  d="M4 7h16M10 11v6m4-6v6M9 4h6l1 2H8l1-2Zm-2 3h10l-.7 11.2a2 2 0 0 1-2 1.8H9.7a2 2 0 0 1-2-1.8L7 7Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <span className="text-xs text-slate-500 dark:text-slate-400">Toca la card para ver detalle</span>
          </div>
        )}
      </div>
    </article>
  );
};
