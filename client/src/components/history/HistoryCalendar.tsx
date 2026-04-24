// Calendario mensual del historial; pinta intensidad por páginas y abre detalle por día.
import { HistoryEvent } from "./types";

interface HistoryCalendarProps {
  loading: boolean;
  error: string | null;
  hasEvents: boolean;
  monthLabel: string;
  weekLabels: string[];
  calendarCells: Array<Date | null>;
  monthEventsByDay: Map<string, HistoryEvent[]>;
  intensityColorByPages: (pages: number) => string;
  getDayKey: (date: Date) => string;
  onShiftMonth: (delta: number) => void;
  onOpenDay: (dayKey: string) => void;
}

export const HistoryCalendar = ({
  loading,
  error,
  hasEvents,
  monthLabel,
  weekLabels,
  calendarCells,
  monthEventsByDay,
  intensityColorByPages,
  getDayKey,
  onShiftMonth,
  onOpenDay
}: HistoryCalendarProps) => {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between border-b border-[#d7b06f]/70 pb-3 text-[#f0dfc5]">
        <p className="font-['Fraunces',serif] text-xl">✦ Historial de lectura</p>
        <span className="text-xs uppercase tracking-[0.1em] text-amber-100/70">Vista mensual</span>
      </div>
      {loading && <p className="rounded-md border border-amber-700/60 bg-[#4b2516] px-4 py-3 text-amber-100">Cargando historial...</p>}
      {!loading && error && <p className="rounded-md border border-rose-500/50 bg-rose-950/35 px-4 py-3 text-rose-100">{error}</p>}
      {!loading && !error && (
        <>
          {!hasEvents && (
            <article className="mb-4 rounded-md border border-amber-700/70 bg-[#e9dcc4] px-4 py-3 text-[#4d311d]">
              <p className="text-sm text-[#7a573c]">Todavía no hay sesiones guardadas. Marca páginas desde cualquier libro en lectura para empezar tu historial.</p>
            </article>
          )}
          <article className="overflow-hidden rounded-md border border-amber-700/70 bg-[#e9dcc4] text-[#4d311d]">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#c89c33] bg-[#5b2a17] px-3 py-2 text-[#e8cf9f]">
              <div className="inline-flex items-center gap-2">
                <button type="button" onClick={() => onShiftMonth(-1)} className="h-7 min-w-8 rounded-none border border-[#8b672d] bg-[#e8d5b5] px-2 text-[#5b2a17] hover:bg-[#e0c89f]">‹</button>
                <p className="min-w-[150px] text-center text-sm font-semibold uppercase tracking-[0.08em]">{monthLabel}</p>
                <button type="button" onClick={() => onShiftMonth(1)} className="h-7 min-w-8 rounded-none border border-[#8b672d] bg-[#e8d5b5] px-2 text-[#5b2a17] hover:bg-[#e0c89f]">›</button>
              </div>
            </div>
            <div className="grid grid-cols-7 border-b border-[#d6c2a0] bg-[#eddcc2] text-center text-[10px] font-semibold uppercase tracking-[0.08em] text-[#7a573c]">
              {weekLabels.map((label) => <div key={label} className="border-r border-[#d6c2a0] px-1 py-1.5 last:border-r-0">{label}</div>)}
            </div>
            <div className="grid grid-cols-7">
              {calendarCells.map((cell, index) => {
                const dayKey = cell ? getDayKey(cell) : "";
                const events = cell ? monthEventsByDay.get(dayKey) ?? [] : [];
                const pages = events.reduce((sum, event) => sum + (event.pagesRead ?? 0), 0);
                const isDarkCell = pages > 40;
                const cellClassName = `min-h-[96px] border-r border-b border-[#d6c2a0] p-1.5 text-left last:border-r-0 ${
                  cell ? "" : "bg-[#efe5d3]/75"
                }`;
                const cellStyle = cell ? { backgroundColor: intensityColorByPages(pages) } : undefined;
                const content = cell ? (
                  <>
                    <div className="mb-1 flex items-center justify-between">
                      <span className={`text-[11px] font-semibold ${isDarkCell ? "text-[#fff8ec]" : "text-[#7a573c]"}`}>{cell.getDate()}</span>
                      <span className={`text-[10px] ${isDarkCell ? "text-[#fff2da]/90" : "text-[#a38253]"}`}>{pages > 0 ? `${pages} pág` : ""}</span>
                    </div>
                    <div className="space-y-1">
                      {events.slice(0, 2).map((event) => (
                        <div key={event.id} className={`border-l-2 pl-1 ${isDarkCell ? "border-[#fff2da]/60" : "border-[#7a573c]/45"}`}>
                          <p className={`truncate text-[10px] font-semibold ${isDarkCell ? "text-[#fff8ec]" : "text-[#4d311d]"}`}>{event.title}</p>
                        </div>
                      ))}
                      {events.length > 2 && <p className={`text-[9px] italic ${isDarkCell ? "text-[#fff2da]/90" : "text-[#7a573c]"}`}>+{events.length - 2} más</p>}
                    </div>
                  </>
                ) : null;

                if (cell && events.length > 0) {
                  return (
                    <button
                      type="button"
                      key={`${dayKey}-${index}`}
                      onClick={() => onOpenDay(dayKey)}
                      className={`${cellClassName} cursor-pointer transition hover:brightness-[0.96]`}
                      style={cellStyle}
                    >
                      {content}
                    </button>
                  );
                }

                return (
                  <div key={cell ? `${dayKey}-${index}` : `empty-${index}`} className={cellClassName} style={cellStyle}>
                    {content}
                  </div>
                );
              })}
            </div>
          </article>
        </>
      )}
    </div>
  );
};
