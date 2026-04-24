// Panel lateral del día seleccionado con sesiones, resumen por libro y acciones rápidas.
import { Trash2, X } from "lucide-react";
import { BookSummary, BooksByIdMap, HistoryEvent } from "./types";

interface DayDetailPanelProps {
  selectedDayKey: string | null;
  selectedDayEvents: HistoryEvent[];
  selectedDayBookSummary: BookSummary[];
  booksById: BooksByIdMap;
  deletingSessionId: string | null;
  onClose: () => void;
  onOpenBook: (bookId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  formatDayLabel: (value: string) => string;
}

export const DayDetailPanel = ({
  selectedDayKey,
  selectedDayEvents,
  selectedDayBookSummary,
  booksById,
  deletingSessionId,
  onClose,
  onOpenBook,
  onDeleteSession,
  formatDayLabel
}: DayDetailPanelProps) => {
  if (!selectedDayKey || selectedDayEvents.length === 0) return null;

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-[#1b0e08]/55 backdrop-blur-[2px]" onClick={onClose} />
      <aside className="fixed right-0 top-0 z-[61] h-full w-full max-w-[440px] border-l border-[#c89c33] bg-[#efe4d1] text-[#4d311d] shadow-[-18px_0_45px_rgba(0,0,0,0.35)]">
        <div className="flex items-start justify-between border-b border-[#c89c33] bg-[#5b2a17] px-4 py-3 text-[#e8cf9f]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em]">Detalle del día</p>
            <p className="mt-1 font-['Fraunces',serif] text-lg">{formatDayLabel(selectedDayKey)}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-[#8b672d] bg-[#e8d5b5] p-1 text-[#5b2a17] hover:bg-[#e0c89f]"
            aria-label="Cerrar detalle del día"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto p-4">
          <article className="rounded-md border border-[#c69253] bg-[#f8efdf]">
            <div className="grid grid-cols-2 gap-3 p-3 text-center">
              <div>
                <p className="font-['Fraunces',serif] text-3xl">
                  {selectedDayEvents.reduce((sum, event) => sum + (event.pagesRead ?? 0), 0)}
                </p>
                <p className="text-[11px] uppercase tracking-[0.1em] text-[#7a573c]">Páginas</p>
              </div>
              <div>
                <p className="font-['Fraunces',serif] text-3xl">{selectedDayEvents.length}</p>
                <p className="text-[11px] uppercase tracking-[0.1em] text-[#7a573c]">Sesiones</p>
              </div>
            </div>
          </article>

          <article className="overflow-hidden rounded-md border border-[#c69253] bg-[#f8efdf]">
            <div className="border-b border-[#dcc8a7] px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#7a573c]">
              Sesiones registradas
            </div>
            <div className="divide-y divide-[#dcc8a7]">
              {selectedDayEvents.map((event) => (
                <div
                  key={event.id}
                  className="grid w-full grid-cols-[38px_1fr_auto] items-center gap-3 px-3 py-2.5 text-left transition hover:bg-[#f2e5cf]"
                >
                  {booksById.get(event.bookId)?.coverUrl ? (
                    <img
                      src={booksById.get(event.bookId)?.coverUrl}
                      alt={`Portada de ${event.title}`}
                      className="h-14 w-9 rounded-sm object-cover"
                    />
                  ) : (
                    <div className="flex h-14 w-9 items-center justify-center rounded-sm bg-[#dcc8a7] text-[9px] font-semibold text-[#7a573c]">
                      Sin
                    </div>
                  )}
                  <div className="min-w-0 space-y-1">
                    <button
                      type="button"
                      onClick={() => onOpenBook(event.bookId)}
                      className="w-full text-left"
                    >
                      <p className="truncate font-['Fraunces',serif] text-base">{event.title}</p>
                    </button>
                    <p className="text-xs text-[#7a573c]">
                      {event.previousPage === null ? `pág. ${event.page}` : `pág. ${event.previousPage} -> ${event.page}`}
                      {" · "}
                      {event.pagesRead === null ? "—" : `+${event.pagesRead} págs`}
                      {" · "}
                      {event.at.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onDeleteSession(event.id)}
                    className="rounded border border-[#c89c33]/60 p-1 text-[#8e633d] transition hover:bg-[#ead9bf] disabled:cursor-not-allowed disabled:opacity-60"
                    aria-label="Borrar sesión"
                    title="Borrar sesión"
                    disabled={deletingSessionId === event.id}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </article>

          <article className="overflow-hidden rounded-md border border-[#c69253] bg-[#f8efdf]">
            <div className="border-b border-[#dcc8a7] px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#7a573c]">
              Resumen por libro
            </div>
            <div className="divide-y divide-[#dcc8a7]">
              {selectedDayBookSummary.map((book) => (
                <div key={book.title} className="flex items-center justify-between px-3 py-2 text-sm">
                  <span className="truncate">{book.title}</span>
                  <span className="text-[#7a573c]">{book.pages} págs · {book.sessions} ses.</span>
                </div>
              ))}
            </div>
          </article>
        </div>
      </aside>
    </>
  );
};
