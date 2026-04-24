// Página orquestadora del historial: compone sidebar, calendario y panel diario.
import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { DayDetailPanel } from "../components/history/DayDetailPanel";
import { HistoryCalendar } from "../components/history/HistoryCalendar";
import { HistorySidebar } from "../components/history/HistorySidebar";
import { IntensityLegendItem } from "../components/history/types";
import {
  buildMonthEventsByDay,
  computeBestDays,
  computeCurrentStreak,
  computeIntensityBuckets
} from "../components/history/historyComputations";
import {
  formatDayLabel,
  formatMonthLabel,
  getDayKey,
  getMonthCalendarCells,
  intensityColorByPages,
  WEEK_LABELS
} from "../components/history/historyUtils";
import { useBooksContext } from "../context/BooksContext";
import { useReadingSessions } from "../hooks/useReadingSessions";

export const ReadingHistoryPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { books, reloadBooks } = useBooksContext();
  const { sessions, loading, error, deletingSessionId, removeSession } = useReadingSessions({
    onDeleteSuccess: async () => {
      await reloadBooks();
    }
  });
  const [viewMonth, setViewMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null);

  const allEvents = useMemo(
    () =>
      sessions
        .map((session) => {
          const at = new Date(session.recordedAt);
          if (Number.isNaN(at.getTime())) return null;
          const previousPage = typeof session.previousPage === "number" ? session.previousPage : null;
          return {
            id: session.id,
            bookId: session.bookId,
            title: session.title,
            author: session.author,
            at,
            dayKey: session.recordedAt.slice(0, 10),
            page: session.currentPage,
            previousPage,
            pagesRead:
              typeof session.pagesRead === "number"
                ? session.pagesRead
                : previousPage === null
                  ? null
                  : Math.max(0, session.currentPage - previousPage)
          };
        })
        .filter((event): event is NonNullable<typeof event> => event !== null)
        .sort((a, b) => b.at.getTime() - a.at.getTime()),
    [sessions]
  );

  const nowReadingBooks = useMemo(
    () =>
      books
        .filter((book) => book.status === "leyendo")
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
    [books]
  );
  const booksById = useMemo(() => new Map(books.map((book) => [book.id, book])), [books]);

  const monthEvents = useMemo(
    () =>
      allEvents.filter(
        (event) =>
          event.at.getFullYear() === viewMonth.getFullYear() &&
          event.at.getMonth() === viewMonth.getMonth()
      ),
    [allEvents, viewMonth]
  );

  const monthEventsByDay = useMemo(() => {
    return buildMonthEventsByDay(monthEvents);
  }, [monthEvents]);

  const monthSummary = useMemo(() => {
    const pages = monthEvents.reduce((sum, event) => sum + (event.pagesRead ?? 0), 0);
    const sessionsCount = monthEvents.length;
    const activeDays = new Set(monthEvents.map((event) => event.dayKey)).size;
    const pagesPerDay = activeDays > 0 ? Math.round(pages / activeDays) : 0;
    return { pages, sessionsCount, pagesPerDay };
  }, [monthEvents]);

  const currentStreak = useMemo(() => computeCurrentStreak(allEvents), [allEvents]);

  const bestDays = useMemo(() => computeBestDays(allEvents), [allEvents]);

  const intensityBuckets = useMemo(
    () => computeIntensityBuckets(monthEventsByDay),
    [monthEventsByDay]
  );

  const intensityLegend = useMemo<IntensityLegendItem[]>(
    () => [
      ["0", intensityBuckets[0], "bg-[#efe3cd]"],
      ["1-10", intensityBuckets[1], "bg-[#e3cfa0]"],
      ["11-25", intensityBuckets[2], "bg-[#d6b56c]"],
      ["26-40", intensityBuckets[3], "bg-[#bf9339]"],
      ["41-60", intensityBuckets[4], "bg-[#a56f2d]"],
      ["61+", intensityBuckets[5], "bg-[#74451d]"]
    ],
    [intensityBuckets]
  );

  const calendarCells = useMemo(() => getMonthCalendarCells(viewMonth), [viewMonth]);
  const selectedDayEvents = useMemo(
    () => (selectedDayKey ? monthEventsByDay.get(selectedDayKey) ?? [] : []),
    [monthEventsByDay, selectedDayKey]
  );
  const selectedDayBookSummary = useMemo(() => {
    const map = new Map<string, { title: string; pages: number; sessions: number }>();
    selectedDayEvents.forEach((event) => {
      const current = map.get(event.bookId);
      map.set(event.bookId, {
        title: event.title,
        pages: (current?.pages ?? 0) + (event.pagesRead ?? 0),
        sessions: (current?.sessions ?? 0) + 1
      });
    });
    return Array.from(map.values()).sort((a, b) => b.pages - a.pages || a.title.localeCompare(b.title, "es"));
  }, [selectedDayEvents]);

  const shiftMonth = (delta: number) => {
    setViewMonth((current) => new Date(current.getFullYear(), current.getMonth() + delta, 1));
    setSelectedDayKey(null);
  };

  const openBookPreview = (bookId: string) => {
    setSelectedDayKey(null);
    navigate(`/?preview=${encodeURIComponent(bookId)}`, {
      state: {
        backgroundLocation: location,
        previewOnly: true
      }
    });
  };

  return (
    <section className="min-h-full space-y-6 bg-transparent pl-1 pr-4 py-2 text-amber-50 sm:pl-2 sm:pr-6">
      <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
        <HistorySidebar
          monthLabel={formatMonthLabel(viewMonth)}
          monthPages={monthSummary.pages}
          monthSessions={monthSummary.sessionsCount}
          pagesPerDay={monthSummary.pagesPerDay}
          currentStreak={currentStreak}
          nowReadingBooks={nowReadingBooks}
          intensityLegend={intensityLegend}
          bestDays={bestDays}
          formatDayLabel={formatDayLabel}
        />

        <HistoryCalendar
          loading={loading}
          error={error}
          hasEvents={allEvents.length > 0}
          monthLabel={formatMonthLabel(viewMonth)}
          weekLabels={WEEK_LABELS}
          calendarCells={calendarCells}
          monthEventsByDay={monthEventsByDay}
          intensityColorByPages={intensityColorByPages}
          getDayKey={getDayKey}
          onShiftMonth={shiftMonth}
          onOpenDay={setSelectedDayKey}
        />
      </div>

      <DayDetailPanel
        selectedDayKey={selectedDayKey}
        selectedDayEvents={selectedDayEvents}
        selectedDayBookSummary={selectedDayBookSummary}
        booksById={booksById}
        deletingSessionId={deletingSessionId}
        onClose={() => setSelectedDayKey(null)}
        onOpenBook={openBookPreview}
        onDeleteSession={(sessionId) => void removeSession(sessionId)}
        formatDayLabel={formatDayLabel}
      />
    </section>
  );
};
