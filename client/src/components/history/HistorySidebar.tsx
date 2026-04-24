// Sidebar de métricas del mes: actividad, libros activos, intensidad y mejores días.
import { Book } from "../../types/book";
import { IntensityLegendItem } from "./types";

interface HistorySidebarProps {
  monthLabel: string;
  monthPages: number;
  monthSessions: number;
  pagesPerDay: number;
  currentStreak: number;
  nowReadingBooks: Book[];
  intensityLegend: IntensityLegendItem[];
  bestDays: Array<{ dayKey: string; pages: number }>;
  formatDayLabel: (value: string) => string;
}

export const HistorySidebar = ({
  monthLabel,
  monthPages,
  monthSessions,
  pagesPerDay,
  currentStreak,
  nowReadingBooks,
  intensityLegend,
  bestDays,
  formatDayLabel
}: HistorySidebarProps) => {
  return (
    <aside className="space-y-3">
      <article className="overflow-hidden rounded-xl border border-[#c69253] bg-[#e9dcc4] text-[#4d311d]">
        <div className="border-b border-[#c89c33] bg-[#1a0b06]/90 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#e8cf9f]">
          🗓️ {monthLabel}
        </div>
        <div className="grid grid-cols-2 gap-3 p-4 text-center">
          <div><p className="font-['Fraunces',serif] text-3xl">{monthPages}</p><p className="text-[11px] uppercase tracking-[0.12em]">Páginas</p></div>
          <div><p className="font-['Fraunces',serif] text-3xl">{monthSessions}</p><p className="text-[11px] uppercase tracking-[0.12em]">Sesiones</p></div>
          <div><p className="font-['Fraunces',serif] text-3xl">{pagesPerDay}</p><p className="text-[11px] uppercase tracking-[0.12em]">Pág/Día</p></div>
          <div><p className="font-['Fraunces',serif] text-3xl">{currentStreak}</p><p className="text-[11px] uppercase tracking-[0.12em]">Racha</p></div>
        </div>
      </article>

      <article className="overflow-hidden rounded-xl border border-[#c69253] bg-[#e9dcc4] text-[#4d311d]">
        <p className="border-b border-[#c89c33] bg-[#1a0b06]/90 px-4 py-3 text-xs font-semibold tracking-[0.18em] text-[#e8cf9f]">📖 LEYENDO AHORA</p>
        {nowReadingBooks.length > 0 ? (
          <div className="divide-y divide-[#dcc8a7]">
            {nowReadingBooks.slice(0, 2).map((book) => (
              <div key={book.id} className="px-4 py-2.5">
                <p className="font-['Fraunces',serif] text-lg leading-tight">{book.title}</p>
                <p className="text-sm">{book.author}</p>
                <p className="text-xs">Avance: {book.progress ?? 0}%</p>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[#d9c7ad]">
                  <div
                    className="h-full rounded-full bg-[#8e633d]"
                    style={{ width: `${Math.max(0, Math.min(100, book.progress ?? 0))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="px-4 py-3 text-sm">No hay lectura activa ahora mismo.</p>
        )}
      </article>

      <article className="overflow-hidden rounded-xl border border-[#c69253] bg-[#e9dcc4] text-[#4d311d]">
        <div className="border-b border-[#c89c33] bg-[#1a0b06]/90 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#e8cf9f]">🔥 Intensidad</div>
        <div className="space-y-2 px-4 py-3 text-xs text-[#7a573c]">
          {intensityLegend.map(([label, value, color]) => (
            <div key={String(label)} className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2"><span className={`inline-block h-3 w-3 rounded-[2px] border border-[#c4a27b]/70 ${color}`} />{label} págs</span>
              <strong className="text-[#6f4b2e]">{value}</strong>
            </div>
          ))}
        </div>
      </article>

      <article className="overflow-hidden rounded-xl border border-[#c69253] bg-[#e9dcc4] text-[#4d311d]">
        <div className="border-b border-[#c89c33] bg-[#1a0b06]/90 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#e8cf9f]">🏆 Mejores días</div>
        <div className="divide-y divide-[#dcc8a7]">
          {bestDays.map((day) => (
            <div key={day.dayKey + day.pages} className="flex items-center justify-between px-4 py-2 text-sm">
              <span className="text-[#7a573c]">{formatDayLabel(day.dayKey)}</span>
              <strong className="text-[#6f4b2e]">{day.pages} págs</strong>
            </div>
          ))}
        </div>
      </article>
    </aside>
  );
};
