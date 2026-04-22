// Tarjeta visual de un libro con portada, estado, progreso y acceso a detalle.
import { KeyboardEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Book } from "../types/book";

interface BookCardProps {
  book: Book;
  index?: number;
  onOpenPreview?: (id: string) => void;
}

export const BookCard = ({ book, index = 0, onOpenPreview }: BookCardProps) => {
  const navigate = useNavigate();
  const [coverBroken, setCoverBroken] = useState(false);

  useEffect(() => {
    setCoverBroken(false);
  }, [book.coverUrl, book.id]);
  const goToDetails = () => {
    if (onOpenPreview) {
      onOpenPreview(book.id);
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
      className="group relative animate-fade-in-up w-full max-w-none cursor-pointer overflow-hidden rounded-sm border border-[#8f643f] bg-[#f2e6d3] text-left shadow-[0_9px_20px_-12px_rgba(0,0,0,0.45)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_26px_-12px_rgba(0,0,0,0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      {book.coverUrl && !coverBroken ? (
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#6a3f1e]">
          <img
            src={book.coverUrl}
            alt={`Portada de ${book.title}`}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            onError={() => setCoverBroken(true)}
          />
          <div
            className="pointer-events-none absolute inset-0 opacity-35"
            style={{
              backgroundImage:
                "radial-gradient(circle at center, rgba(244,215,165,0.22) 1px, transparent 1px), radial-gradient(circle at center, rgba(244,215,165,0.14) 1px, transparent 1px)",
              backgroundSize: "24px 24px, 24px 24px",
              backgroundPosition: "0 0, 12px 12px"
            }}
          />
        </div>
      ) : (
        <div className="relative flex aspect-[3/4] w-full items-center justify-center bg-gradient-to-b from-[#2c5f31] via-[#2a4d2f] to-[#234127] px-4 text-center text-sm font-semibold text-amber-100">
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                "radial-gradient(circle at center, rgba(244,215,165,0.32) 1px, transparent 1px), radial-gradient(circle at center, rgba(244,215,165,0.18) 1px, transparent 1px)",
              backgroundSize: "22px 22px, 22px 22px",
              backgroundPosition: "0 0, 11px 11px"
            }}
          />
          <span className="relative z-10">{book.title}</span>
        </div>
      )}
      {book.isFavorite && (
        <span className="pointer-events-none absolute right-2 top-2 z-20 inline-flex items-center rounded-sm border border-rose-300/70 bg-black/55 px-1.5 py-1 text-rose-300">
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </span>
      )}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/35 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="min-h-[7.2rem] space-y-1 border-t border-[#8f643f] bg-[#f2e6d3] px-2.5 py-2.5 text-[#4d311d]">
        <p className="line-clamp-2 min-h-[2.4rem] font-['Fraunces',serif] text-[0.95rem] leading-tight">{book.title}</p>
        <p className="line-clamp-1 min-h-[1rem] text-xs italic opacity-85">{book.author}</p>
        <div className="flex items-center justify-between pt-1 text-[10px] uppercase tracking-[0.12em] text-[#7a573c]">
          <span>{book.genre}</span>
          <span>{book.publicationYear ?? "s/f"}</span>
        </div>
        <div className="border-t border-[#d5be9d] pt-1 text-[11px] text-[#8e633d]">
          {"★".repeat(book.rating ?? 0)}
          {"☆".repeat(Math.max(0, 5 - (book.rating ?? 0)))}
        </div>
      </div>
    </article>
  );
};
