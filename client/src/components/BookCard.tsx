// Tarjeta visual de un libro con portada, estado, progreso y acceso a detalle.
import { KeyboardEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "./ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "./ui/dialog";
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [coverBroken, setCoverBroken] = useState(false);

  useEffect(() => {
    setCoverBroken(false);
  }, [book.coverUrl, book.id]);
  const statusStyles: Record<Book["status"], string> = {
    pendiente:
      "rounded-full border border-yellow-300 bg-yellow-100/95 px-3 py-1.5 text-sm font-bold text-yellow-900 shadow-md backdrop-blur-sm dark:border-yellow-500 dark:bg-yellow-900/80 dark:text-yellow-100",
    leyendo:
      "rounded-full border border-cyan-300 bg-cyan-100/95 px-3 py-1.5 text-sm font-bold text-cyan-900 shadow-md backdrop-blur-sm dark:border-cyan-500 dark:bg-cyan-900/80 dark:text-cyan-100",
    leido:
      "rounded-full border border-emerald-300 bg-emerald-100/95 px-3 py-1.5 text-sm font-bold text-emerald-900 shadow-md backdrop-blur-sm dark:border-emerald-500 dark:bg-emerald-900/80 dark:text-emerald-100"
  };

  const goToDetails = () => {
    if (menuOpen) {
      setMenuOpen(false);
      return;
    }
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
      className="group relative animate-fade-in-up aspect-[2/3] w-full max-w-xs cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_24px_rgba(29,78,216,0.42),0_24px_60px_-20px_rgba(30,58,138,0.62)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 dark:border-slate-800 dark:bg-slate-900 dark:hover:shadow-[0_0_28px_rgba(0,183,255,0.5),0_24px_60px_-20px_rgba(8,47,73,0.95)]"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger
          aria-label={`Abrir menú de ${book.title}`}
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
          className="absolute right-3 top-3 z-20 inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-black/55 text-white transition hover:bg-black/70"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
            <circle cx="12" cy="5" r="1.8" />
            <circle cx="12" cy="12" r="1.8" />
            <circle cx="12" cy="19" r="1.8" />
          </svg>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="min-w-[130px] rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-slate-700 dark:bg-slate-900"
          onClick={(event) => event.stopPropagation()}
        >
          <DropdownMenuItem
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            onClick={() => {
              setMenuOpen(false);
              navigate(`/books/${book.id}/edit`);
            }}
          >
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem
            className="rounded-lg px-3 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-950/40"
            onClick={() => {
              setMenuOpen(false);
              setConfirmDelete(true);
            }}
          >
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {book.coverUrl && !coverBroken ? (
        <div className="h-full w-full overflow-hidden">
          <img
            src={book.coverUrl}
            alt={`Portada de ${book.title}`}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            onError={() => setCoverBroken(true)}
          />
        </div>
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-b from-cyan-100 to-cyan-200 text-center text-sm font-semibold text-cyan-700 dark:from-cyan-900/40 dark:to-cyan-800/40 dark:text-cyan-300">
          Sin portada
        </div>
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <span className={`pointer-events-none absolute left-3 top-3 z-20 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100 ${statusStyles[book.status]}`}>
        {book.status}
      </span>
      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent
          className="rounded-xl border border-rose-200 bg-white/95 p-0 shadow-lg dark:border-rose-900/50 dark:bg-slate-900/95"
          onClick={(event) => event.stopPropagation()}
          showCloseButton={false}
        >
          <DialogHeader className="p-4 pb-2">
            <DialogTitle className="text-sm font-medium text-rose-900 dark:text-rose-100">
              ¿Eliminar este libro?
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mx-0 mb-0 rounded-b-xl border-rose-100 bg-rose-50/60 p-3 dark:border-rose-900/30 dark:bg-rose-950/20">
            <Button onClick={() => setConfirmDelete(false)} disabled={isDeleting} variant="outline" size="sm">
              Cancelar
            </Button>
            <Button onClick={() => void onDelete?.(book.id)} disabled={isDeleting} variant="destructive" size="sm">
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </article>
  );
};
