import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Bookmark, CalendarDays, Clock3, Flame, Heart, ShoppingBag, Star, Trophy } from "lucide-react";
import { getReadableErrorMessage, getWishlistAcquisitions } from "../api/client";
import { Select } from "../components/ui/select";
import { useAuth } from "../context/AuthContext";
import { useBooksContext } from "../context/BooksContext";
import { Book } from "../types/book";
import { WishlistAcquisition } from "../types/wishlist";

const monthLabels = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
const ONE_DAY_MS = 86400000;

const parseDate = (value?: string) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const toStartOfLocalDayMs = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

const getReadDate = (book: Book) => parseDate(book.readAt) ?? parseDate(book.updatedAt) ?? parseDate(book.createdAt);

const formatCompactNumber = (value: number) => {
  if (value >= 1000) {
    const compact = value / 1000;
    return `${Number.isInteger(compact) ? compact.toFixed(0) : compact.toFixed(1)}k`;
  }
  return `${value}`;
};

const formatMoneyEur = (value: number) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(value);

/** Intenta extraer un importe del texto libre de «precio» al marcar compra en lista de deseos. */
const parsePriceToNumber = (raw: string | undefined): number | null => {
  if (!raw?.trim()) return null;
  const lower = raw.trim().toLowerCase();
  if (lower.includes("sin precio")) return null;
  let t = lower.replace(/€|eur|\s/gi, "");
  const hasComma = t.includes(",");
  const hasDot = t.includes(".");
  if (hasComma && hasDot) {
    t = t.lastIndexOf(",") > t.lastIndexOf(".") ? t.replace(/\./g, "").replace(",", ".") : t.replace(/,/g, "");
  } else if (hasComma) {
    t = t.replace(",", ".");
  }
  t = t.replace(/[^\d.-]/g, "");
  const n = Number.parseFloat(t);
  return Number.isFinite(n) && n >= 0 ? n : null;
};

const activityColorByCount = (count: number) => {
  if (count <= 0) return "#efe3cd";
  if (count === 1) return "#e3cfa0";
  if (count === 2) return "#d6b56c";
  if (count === 3) return "#bf9339";
  return "#8f6430";
};

const spendColorByRatio = (amount: number, maxAmount: number) => {
  if (amount <= 0 || maxAmount <= 0) return "#efe3cd";
  const r = amount / maxAmount;
  if (r < 0.15) return "#e3cfa0";
  if (r < 0.35) return "#d6b56c";
  if (r < 0.55) return "#bf9339";
  if (r < 0.75) return "#a56f2d";
  return "#74451d";
};

/** Colores de barra por posición (evita repetir el mismo marrón en géneros 1.º, 6.º, etc.). */
const GENRE_BAR_COLORS = [
  "#8e633d",
  "#213a83",
  "#2b7f71",
  "#59318f",
  "#b84a3d",
  "#2a5f8f",
  "#a23b72",
  "#5c6bc0",
  "#e07a1f",
  "#386651"
];

const genreBarColorAt = (index: number) => GENRE_BAR_COLORS[index % GENRE_BAR_COLORS.length];

const formatMoneyShortEur = (n: number, hasPurchasesInMonth: boolean) => {
  if (n <= 0) return hasPurchasesInMonth ? "0 €" : "—";
  if (n >= 1000) {
    const k = n / 1000;
    return `${k >= 10 ? Math.round(k) : k.toFixed(1).replace(".", ",")}k €`;
  }
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
};

const toRoman = (value: number) => {
  const map: Array<[number, string]> = [
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"]
  ];
  let num = value;
  let result = "";
  map.forEach(([amount, symbol]) => {
    while (num >= amount) {
      result += symbol;
      num -= amount;
    }
  });
  return result || "I";
};

export const StatisticsPage = () => {
  const { isAuthenticated } = useAuth();
  const { books, loading, error } = useBooksContext();
  const [acquisitions, setAcquisitions] = useState<WishlistAcquisition[]>([]);
  const [acquisitionsLoading, setAcquisitionsLoading] = useState(false);
  const [acquisitionsError, setAcquisitionsError] = useState<string | null>(null);
  const [purchaseBreakdownYear, setPurchaseBreakdownYear] = useState(() => new Date().getFullYear());

  useEffect(() => {
    if (!isAuthenticated) {
      setAcquisitions([]);
      setAcquisitionsError(null);
      setAcquisitionsLoading(false);
      return;
    }
    let cancelled = false;
    const load = async () => {
      try {
        setAcquisitionsLoading(true);
        setAcquisitionsError(null);
        const data = await getWishlistAcquisitions();
        if (!cancelled) setAcquisitions(data);
      } catch (err) {
        if (!cancelled) {
          setAcquisitions([]);
          setAcquisitionsError(getReadableErrorMessage(err, "No se pudieron cargar las compras."));
        }
      } finally {
        if (!cancelled) setAcquisitionsLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  useEffect(() => {
    const years = new Set<number>();
    acquisitions.forEach((item) => {
      const y = parseDate(item.purchasedAt)?.getFullYear();
      if (y) years.add(y);
    });
    if (years.size === 0) return;
    setPurchaseBreakdownYear((prev) => (years.has(prev) ? prev : Math.max(...years)));
  }, [acquisitions]);

  const allBooksCount = books.length;
  const readBooks = useMemo(() => books.filter((book) => book.status === "leido"), [books]);
  const now = new Date();
  const currentYear = now.getFullYear();

  const booksReadThisYear = useMemo(() => {
    return readBooks.filter((book) => getReadDate(book)?.getFullYear() === currentYear).length;
  }, [currentYear, readBooks]);

  const averageRating = useMemo(() => {
    const rated = readBooks.filter((book) => typeof book.rating === "number" && (book.rating ?? 0) > 0);
    if (rated.length === 0) return "0.0";
    const total = rated.reduce((sum, book) => sum + (book.rating ?? 0), 0);
    return (total / rated.length).toFixed(1);
  }, [readBooks]);

  const totalReadPages = useMemo(
    () => readBooks.reduce((sum, book) => sum + (typeof book.pages === "number" ? book.pages : 0), 0),
    [readBooks]
  );
  const nowReadingBooks = useMemo(
    () =>
      books
        .filter((book) => book.status === "leyendo")
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
    [books]
  );

  const booksByYear = useMemo(() => {
    const map = new Map<number, number>();
    readBooks.forEach((book) => {
      const year = getReadDate(book)?.getFullYear();
      if (!year) return;
      map.set(year, (map.get(year) ?? 0) + 1);
    });
    return Array.from(map.entries()).sort((a, b) => a[0] - b[0]);
  }, [readBooks]);

  const topGenres = useMemo(() => {
    const map = new Map<string, number>();
    books.forEach((book) => {
      const genre = book.genre.trim();
      if (!genre) return;
      map.set(genre, (map.get(genre) ?? 0) + 1);
    });
    const total = Array.from(map.values()).reduce((sum, amount) => sum + amount, 0);
    const sorted = Array.from(map.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "es"))
      .slice(0, 8)
      .map(([genre, count]) => ({
        genre,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0
      }));
    return sorted;
  }, [books]);
  const shelfStats = useMemo(
    () => ({
      todos: books.length,
      leidos: readBooks.length,
      leyendo: nowReadingBooks.length,
      pendientes: books.filter((book) => book.status === "pendiente").length,
      favoritos: books.filter((book) => book.isFavorite).length
    }),
    [books, nowReadingBooks.length, readBooks.length]
  );
  const collectionGenres = useMemo(() => {
    const map = new Map<string, number>();
    books.forEach((book) => {
      const genre = book.genre.trim();
      if (!genre) return;
      map.set(genre, (map.get(genre) ?? 0) + 1);
    });
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "es"));
  }, [books]);

  const selectedYear = useMemo(() => {
    if (booksByYear.length === 0) return currentYear;
    return booksByYear[booksByYear.length - 1][0];
  }, [booksByYear, currentYear]);

  const monthlyReadActivity = useMemo(() => {
    const counts = Array.from({ length: 12 }, () => 0);
    const booksByMonth: string[][] = Array.from({ length: 12 }, () => []);
    readBooks.forEach((book) => {
      const date = getReadDate(book);
      if (!date || date.getFullYear() !== selectedYear) return;
      const month = date.getMonth();
      counts[month] += 1;
      booksByMonth[month].push(book.title);
    });
    return { counts, booksByMonth };
  }, [readBooks, selectedYear]);

  const bestRatedBooks = useMemo(() => {
    return readBooks
      .filter((book) => typeof book.rating === "number" && (book.rating ?? 0) > 0)
      .sort((a, b) => {
        const ratingDiff = (b.rating ?? 0) - (a.rating ?? 0);
        if (ratingDiff !== 0) return ratingDiff;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      })
      .slice(0, 5);
  }, [readBooks]);

  const purchaseStats = useMemo(() => {
    let totalParsed = 0;
    let parsedCount = 0;
    acquisitions.forEach((item) => {
      const n = parsePriceToNumber(item.price);
      if (n !== null) {
        totalParsed += n;
        parsedCount += 1;
      }
    });
    const avgPerPurchase = parsedCount > 0 ? totalParsed / parsedCount : null;
    return {
      totalAcquisitions: acquisitions.length,
      totalSpentParsed: totalParsed,
      parsedPricesCount: parsedCount,
      avgPerPurchase
    };
  }, [acquisitions]);

  const purchaseYearOptions = useMemo(() => {
    const ys = new Set<number>();
    acquisitions.forEach((item) => {
      const y = parseDate(item.purchasedAt)?.getFullYear();
      if (y) ys.add(y);
    });
    ys.add(currentYear);
    ys.add(purchaseBreakdownYear);
    return Array.from(ys).sort((a, b) => b - a);
  }, [acquisitions, currentYear, purchaseBreakdownYear]);

  const purchaseMonthlyForYear = useMemo(() => {
    const counts = Array.from({ length: 12 }, () => 0);
    const amounts = Array.from({ length: 12 }, () => 0);
    acquisitions.forEach((item) => {
      const d = parseDate(item.purchasedAt);
      if (!d || d.getFullYear() !== purchaseBreakdownYear) return;
      const m = d.getMonth();
      counts[m] += 1;
      const n = parsePriceToNumber(item.price);
      if (n !== null) amounts[m] += n;
    });
    const maxAmount = Math.max(...amounts, 0);
    const yearBookTotal = counts.reduce((a, b) => a + b, 0);
    const yearSpentTotal = amounts.reduce((a, b) => a + b, 0);
    return { counts, amounts, maxAmount, yearBookTotal, yearSpentTotal };
  }, [acquisitions, purchaseBreakdownYear]);

  const rhythmStats = useMemo(() => {
    if (readBooks.length === 0) {
      return {
        pagesPerDay: 0,
        daysPerBook: 0,
        bestMonth: "-",
        currentStreakDays: 0,
        longestStreakDays: 0,
        yearlyProjection: 0
      };
    }

    const readDates = readBooks
      .map((book) => getReadDate(book))
      .filter((date): date is Date => date !== null)
      .sort((a, b) => a.getTime() - b.getTime());
    const firstDate = readDates[0] ?? now;
    const elapsedDays = Math.max(1, Math.ceil((now.getTime() - firstDate.getTime()) / 86400000) + 1);

    const pagesPerDay = totalReadPages > 0 ? totalReadPages / elapsedDays : 0;
    const daysPerBook = elapsedDays / readBooks.length;

    const monthMap = new Map<number, number>();
    readDates.forEach((date) => {
      const key = date.getFullYear() * 100 + date.getMonth();
      monthMap.set(key, (monthMap.get(key) ?? 0) + 1);
    });
    let bestMonth = "-";
    let bestMonthCount = 0;
    monthMap.forEach((count, key) => {
      if (count <= bestMonthCount) return;
      bestMonthCount = count;
      const month = key % 100;
      bestMonth = monthLabels[month] ?? "-";
    });

    const activityDates = books
      .map((book) => {
        if (book.status === "leido") {
          return getReadDate(book);
        }
        if (book.status === "leyendo") {
          return parseDate(book.lastPageMarkedAt);
        }
        return null;
      })
      .filter((date): date is Date => date !== null);

    const uniqueActivityDays = Array.from(new Set(activityDates.map((date) => toStartOfLocalDayMs(date)))).sort(
      (a, b) => a - b
    );
    let longestStreakDays = uniqueActivityDays.length > 0 ? 1 : 0;
    let currentRun = longestStreakDays;
    for (let i = 1; i < uniqueActivityDays.length; i += 1) {
      const prev = uniqueActivityDays[i - 1];
      const current = uniqueActivityDays[i];
      const deltaDays = Math.round((current - prev) / ONE_DAY_MS);
      currentRun = deltaDays === 1 ? currentRun + 1 : 1;
      longestStreakDays = Math.max(longestStreakDays, currentRun);
    }
    const todayDayMs = toStartOfLocalDayMs(now);
    let currentStreakDays = 0;
    if (uniqueActivityDays.length > 0 && uniqueActivityDays[uniqueActivityDays.length - 1] === todayDayMs) {
      currentStreakDays = 1;
      for (let i = uniqueActivityDays.length - 1; i > 0; i -= 1) {
        const deltaDays = Math.round((uniqueActivityDays[i] - uniqueActivityDays[i - 1]) / ONE_DAY_MS);
        if (deltaDays !== 1) break;
        currentStreakDays += 1;
      }
    }

    const yearlyProjection = Math.round((readBooks.length / elapsedDays) * 365);

    return {
      pagesPerDay,
      daysPerBook,
      bestMonth,
      currentStreakDays,
      longestStreakDays,
      yearlyProjection
    };
  }, [books, now, readBooks, totalReadPages]);

  return (
    <section className="min-h-full space-y-6 bg-transparent pl-1 pr-4 py-2 text-amber-50 sm:pl-2 sm:pr-6">
      <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
        <aside className="order-2 space-y-3 lg:order-1">
          <article className="overflow-hidden rounded-xl border border-[#c69253] bg-[#e9dcc4] text-[#4d311d]">
            <div className="border-b border-[#c89c33] bg-[#1a0b06]/90 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#e8cf9f]">
              📚 Mi biblioteca
            </div>
            <div className="grid grid-cols-2 gap-3 p-4 text-center">
              <div>
                <p className="font-['Fraunces',serif] text-3xl">{allBooksCount}</p>
                <p className="text-[11px] uppercase tracking-[0.12em]">Libros</p>
              </div>
              <div>
                <p className="font-['Fraunces',serif] text-3xl">{readBooks.length}</p>
                <p className="text-[11px] uppercase tracking-[0.12em]">Leídos</p>
              </div>
              <div>
                <p className="font-['Fraunces',serif] text-3xl">{averageRating}</p>
                <p className="text-[11px] uppercase tracking-[0.12em]">Valoración</p>
              </div>
              <div>
                <p className="font-['Fraunces',serif] text-3xl">{booksReadThisYear}</p>
                <p className="text-[11px] uppercase tracking-[0.12em]">Este año</p>
              </div>
            </div>
          </article>

          <article className="overflow-hidden rounded-xl border border-[#c69253] bg-[#e9dcc4] text-[#4d311d]">
            <div className="border-b border-[#c89c33] bg-[#1a0b06]/90 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#e8cf9f]">
              📖 Leyendo ahora
            </div>
            <div className="divide-y divide-[#dcc8a7]">
              {nowReadingBooks.length === 0 ? (
                <p className="px-4 py-3 text-sm">No hay lectura activa ahora mismo.</p>
              ) : (
                nowReadingBooks.slice(0, 2).map((book) => (
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
                ))
              )}
            </div>
          </article>

          <article className="overflow-hidden rounded-xl border border-[#c69253] bg-[#e9dcc4] text-[#4d311d]">
            <div className="border-b border-[#c89c33] bg-[#1a0b06]/90 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#e8cf9f]">
              🗂️ Estantes
            </div>
            <ul className="divide-y divide-[#dcc8a7] text-[1.02rem]">
              <li className="flex items-center justify-between px-4 py-2.5">
                <span className="inline-flex items-center gap-2"><BookOpen className="h-4 w-4 text-[#8e633d]" />Todos</span>
                <span className="font-semibold text-[#6f4b2e]">{shelfStats.todos}</span>
              </li>
              <li className="flex items-center justify-between px-4 py-2.5">
                <span className="inline-flex items-center gap-2"><BookOpen className="h-4 w-4 text-[#8e633d]" />Pendientes</span>
                <span className="font-semibold text-[#6f4b2e]">{shelfStats.pendientes}</span>
              </li>
              <li className="flex items-center justify-between px-4 py-2.5">
                <span className="inline-flex items-center gap-2"><Bookmark className="h-4 w-4 text-[#8e633d]" />Leídos</span>
                <span className="font-semibold text-[#6f4b2e]">{shelfStats.leidos}</span>
              </li>
              <li className="flex items-center justify-between px-4 py-2.5">
                <span className="inline-flex items-center gap-2"><Clock3 className="h-4 w-4 text-[#8e633d]" />En progreso</span>
                <span className="font-semibold text-[#6f4b2e]">{shelfStats.leyendo}</span>
              </li>
              <li className="flex items-center justify-between px-4 py-2.5">
                <span className="inline-flex items-center gap-2"><Heart className="h-4 w-4 text-[#8e633d]" />Favoritos</span>
                <span className="font-semibold text-[#6f4b2e]">{shelfStats.favoritos}</span>
              </li>
            </ul>
          </article>

          <article className="overflow-hidden rounded-xl border border-[#c69253] bg-[#e9dcc4] text-[#4d311d]">
            <div className="border-b border-[#c89c33] bg-[#1a0b06]/90 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#e8cf9f]">
              🏷️ Géneros
            </div>
            <ul className="divide-y divide-[#dcc8a7] text-[1.02rem]">
              <li className="flex items-center justify-between px-4 py-2.5">
                <span className="line-clamp-1">Todos</span>
                <span className="font-semibold text-[#6f4b2e]">{books.length}</span>
              </li>
              {collectionGenres.map(([genre, count]) => (
                <li key={genre} className="flex items-center justify-between px-4 py-2.5">
                  <span className="truncate">{genre}</span>
                  <span className="font-semibold text-[#6f4b2e]">{count}</span>
                </li>
              ))}
              {collectionGenres.length === 0 && <li className="px-4 py-3 text-[#7a573c]">Sin géneros todavía.</li>}
            </ul>
          </article>

          <article className="overflow-hidden rounded-xl border border-[#c69253] bg-[#e9dcc4] text-[#4d311d]">
            <div className="border-b border-[#c89c33] bg-[#1a0b06]/90 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#e8cf9f]">
              🛍️ Compras (lista de deseos)
            </div>
            <div className="grid grid-cols-2 gap-3 p-4 text-center">
              <div>
                <p className="font-['Fraunces',serif] text-3xl">{acquisitionsLoading ? "…" : purchaseStats.totalAcquisitions}</p>
                <p className="text-[11px] uppercase tracking-[0.12em]">Registradas</p>
              </div>
              <div>
                <p className="font-['Fraunces',serif] text-2xl leading-tight">
                  {acquisitionsLoading
                    ? "…"
                    : purchaseStats.parsedPricesCount > 0
                      ? formatMoneyEur(purchaseStats.totalSpentParsed)
                      : "—"}
                </p>
                <p className="text-[11px] uppercase tracking-[0.12em]">Gasto total</p>
              </div>
            </div>
            {acquisitionsError && <p className="border-t border-[#dcc8a7] px-3 py-2 text-[11px] text-rose-800">{acquisitionsError}</p>}
          </article>
        </aside>

        <div className="order-1 min-w-0 w-full max-w-full lg:order-2">
          <div className="mb-4 flex items-center justify-between border-b border-[#d7b06f]/70 pb-3 text-[#f0dfc5]">
            <p className="font-['Fraunces',serif] text-xl">✦ Estadísticas de lectura</p>
            <span className="text-xs uppercase tracking-[0.1em] text-amber-100/70">Resumen actualizado</span>
          </div>

          {loading && <p className="rounded-md border border-amber-700/60 bg-[#4b2516] px-4 py-3 text-amber-100">Cargando estadísticas...</p>}
          {!loading && error && (
            <p className="rounded-md border border-rose-500/50 bg-rose-950/35 px-4 py-3 text-rose-100">{error}</p>
          )}

          {!loading && !error && (
            <div className="space-y-4">
              <article className="overflow-hidden rounded-md border border-amber-700/70 bg-[#e9dcc4] text-[#4d311d]">
                <div className="border-b border-[#c89c33] bg-[#5b2a17] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#e8cf9f]">
                  📚 Resumen general
                </div>
                <div className="grid grid-cols-2 divide-x divide-y divide-[#c4a27b]/50 sm:grid-cols-4 sm:divide-y-0">
                  <div className="p-4 text-center">
                    <p className="font-['Fraunces',serif] text-4xl leading-none">{allBooksCount}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.08em] text-[#7a573c]">En colección</p>
                  </div>
                  <div className="p-4 text-center">
                    <p className="font-['Fraunces',serif] text-4xl leading-none">{booksReadThisYear}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.08em] text-[#7a573c]">Este año</p>
                  </div>
                  <div className="p-4 text-center">
                    <p className="font-['Fraunces',serif] text-4xl leading-none">{averageRating}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.08em] text-[#7a573c]">Valoración media</p>
                  </div>
                  <div className="p-4 text-center">
                    <p className="font-['Fraunces',serif] text-4xl leading-none">{formatCompactNumber(totalReadPages)}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.08em] text-[#7a573c]">Páginas leídas</p>
                  </div>
                </div>
              </article>

              <div className="grid gap-4 lg:grid-cols-2">
                <article className="overflow-hidden rounded-md border border-amber-700/70 bg-[#e9dcc4] text-[#4d311d]">
                  <div className="border-b border-[#c89c33] bg-[#5b2a17] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#e8cf9f]">
                    🗓️ Libros por año
                  </div>
                  <div className="p-4">
                    {booksByYear.length === 0 ? (
                      <p className="text-sm text-[#7a573c]">Aún no hay libros leídos para mostrar.</p>
                    ) : (
                      <div className="grid grid-cols-3 gap-3 text-center sm:grid-cols-5">
                        {booksByYear.map(([year, count]) => (
                          <div key={year} className="border-b border-[#c4a27b]/70 pb-1">
                            <p className="font-['Fraunces',serif] text-xl leading-none">{count}</p>
                            <p className="mt-1 text-[11px] text-[#7a573c]">{year}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </article>

                <article className="overflow-hidden rounded-md border border-amber-700/70 bg-[#e9dcc4] text-[#4d311d]">
                  <div className="border-b border-[#c89c33] bg-[#5b2a17] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#e8cf9f]">
                    🎯 Géneros favoritos
                  </div>
                  <div className="space-y-2 p-4">
                    {topGenres.length === 0 && <p className="text-sm text-[#7a573c]">Aún no hay géneros suficientes.</p>}
                    {topGenres.map((item, index) => (
                      <div key={item.genre} className="grid grid-cols-[minmax(90px,1fr)_minmax(140px,3fr)_40px] items-center gap-2 text-sm">
                        <span className="truncate">{item.genre}</span>
                        <div className="h-2 overflow-hidden rounded-full bg-[#d9c7ad]">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${item.percentage}%`, backgroundColor: genreBarColorAt(index) }}
                          />
                        </div>
                        <span className="text-right text-xs text-[#7a573c]">{item.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </article>
              </div>

              <article className="overflow-visible rounded-md border border-amber-700/70 bg-[#e9dcc4] text-[#4d311d]">
                <div className="border-b border-[#c89c33] bg-[#5b2a17] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#e8cf9f]">
                  🧩 Actividad de lectura {selectedYear}
                </div>
                <div className="px-4 pb-4 pt-10">
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-6 lg:grid-cols-12">
                    {monthlyReadActivity.counts.map((count, index) => {
                      return (
                      <div key={monthLabels[index]} className="group relative text-center">
                        <div className="mb-1 h-14 rounded-sm border border-[#c4a27b]/55" style={{ backgroundColor: activityColorByCount(count) }} />
                          <p className="text-[10px] uppercase text-[#7a573c]">{monthLabels[index]}</p>
                        {monthlyReadActivity.booksByMonth[index].length > 0 && (
                          <div className="pointer-events-none absolute bottom-[calc(100%+6px)] left-1/2 z-20 hidden w-52 -translate-x-1/2 rounded-md border border-[#c69253] bg-[#f8f1e5] p-2 text-left shadow-lg group-hover:block">
                            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#7a573c]">
                              {monthLabels[index]} {selectedYear}
                            </p>
                            <ul className="space-y-0.5">
                              {monthlyReadActivity.booksByMonth[index].slice(0, 6).map((title) => (
                                <li key={title} className="truncate text-xs text-[#4d311d]">- {title}</li>
                              ))}
                            </ul>
                            {monthlyReadActivity.booksByMonth[index].length > 6 && (
                              <p className="mt-1 text-[10px] italic text-[#7a573c]">
                                +{monthlyReadActivity.booksByMonth[index].length - 6} más
                              </p>
                            )}
                          </div>
                        )}
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-[10px] text-[#7a573c]">
                    {[
                      { label: "0 libros", color: activityColorByCount(0) },
                      { label: "1 libro", color: activityColorByCount(1) },
                      { label: "2 libros", color: activityColorByCount(2) },
                      { label: "3 libros", color: activityColorByCount(3) },
                      { label: "4+ libros", color: activityColorByCount(4) }
                    ].map((item) => (
                      <span
                        key={item.label}
                        className="inline-flex items-center gap-1"
                      >
                        <span
                        className="inline-block h-3 w-3 rounded-[2px] border border-[#c4a27b]/60"
                        style={{ backgroundColor: item.color }}
                      />
                        <span>{item.label}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </article>

              <div className="grid gap-4 lg:grid-cols-2">
                <article className="overflow-hidden rounded-md border border-amber-700/70 bg-[#e9dcc4] text-[#4d311d]">
                  <div className="border-b border-[#c89c33] bg-[#5b2a17] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#e8cf9f]">
                    ⭐ Mejores valorados
                  </div>
                  <div className="p-2">
                    {bestRatedBooks.length === 0 ? (
                      <p className="px-2 py-3 text-sm text-[#7a573c]">Todavía no hay valoraciones para esta sección.</p>
                    ) : (
                      bestRatedBooks.map((book, index) => (
                        <div key={book.id} className="grid grid-cols-[30px_1fr_auto] items-center gap-3 border-b border-[#c4a27b]/45 px-2 py-2 last:border-b-0">
                          <span className="font-['Fraunces',serif] text-xl text-[#7a573c]">{toRoman(index + 1)}</span>
                          <div className="min-w-0">
                            <p className="truncate font-['Fraunces',serif] text-lg leading-none">{book.title}</p>
                            <p className="truncate text-xs italic text-[#7a573c]">{book.author}</p>
                          </div>
                          <p className="text-sm text-[#c89c33]">
                            {"★".repeat(book.rating ?? 0)}
                            {"☆".repeat(Math.max(0, 5 - (book.rating ?? 0)))}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </article>

                <article className="overflow-hidden rounded-md border border-amber-700/70 bg-[#e9dcc4] text-[#4d311d]">
                  <div className="border-b border-[#c89c33] bg-[#5b2a17] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#e8cf9f]">
                    ⏱️ Ritmo de lectura
                  </div>
                  <div className="space-y-3 p-4 text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-[#8e633d]" />
                        Páginas por día (media)
                      </span>
                      <strong>{rhythmStats.pagesPerDay.toFixed(1)}</strong>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-[#8e633d]" />
                        Días por libro (media)
                      </span>
                      <strong>{rhythmStats.daysPerBook.toFixed(1)}</strong>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-[#8e633d]" />
                        Mejor mes del año
                      </span>
                      <strong>{rhythmStats.bestMonth}</strong>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-2">
                        <Flame className="h-4 w-4 text-[#8e633d]" />
                        Racha actual
                      </span>
                      <strong>{rhythmStats.currentStreakDays} días</strong>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-2">
                        <Flame className="h-4 w-4 text-[#8e633d]" />
                        Racha más larga
                      </span>
                      <strong>{rhythmStats.longestStreakDays} días</strong>
                    </div>
                    <div className="pt-2 text-center text-xs italic text-[#7a573c]">
                      <span className="inline-flex items-center gap-1">
                        <Star className="h-3 w-3 fill-current text-[#c89c33]" />A este ritmo leerás ~{rhythmStats.yearlyProjection} libros en {currentYear}.
                      </span>
                    </div>
                  </div>
                </article>
              </div>

              <article className="overflow-hidden rounded-md border border-amber-700/70 bg-[#e9dcc4] text-[#4d311d]">
                <div className="border-b border-[#c89c33] bg-[#5b2a17] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#e8cf9f]">
                  <span className="inline-flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4 text-[#e8cf9f]" />
                    Compras desde la lista de deseos
                  </span>
                </div>
                <div className="grid grid-cols-2 divide-x divide-[#c4a27b]/50">
                  <div className="p-4 text-center">
                    <p className="font-['Fraunces',serif] text-4xl leading-none">
                      {acquisitionsLoading ? "…" : purchaseStats.totalAcquisitions}
                    </p>
                    <p className="mt-1 text-xs uppercase tracking-[0.08em] text-[#7a573c]">Libros comprados (total)</p>
                  </div>
                  <div className="p-4 text-center">
                    <p className="font-['Fraunces',serif] text-3xl leading-none sm:text-4xl">
                      {acquisitionsLoading
                        ? "…"
                        : purchaseStats.parsedPricesCount > 0
                          ? formatMoneyEur(purchaseStats.totalSpentParsed)
                          : "—"}
                    </p>
                    <p className="mt-1 text-xs uppercase tracking-[0.08em] text-[#7a573c]">Dinero gastado (total)</p>
                  </div>
                </div>

                <div className="border-t border-[#c4a27b]/50 bg-[#f8f1e5]/40 px-4 py-3">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7a573c]">Por mes</p>
                      <p className="text-xs text-[#8e633d]">Elige un año para ver compras y gasto mes a mes.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <label htmlFor="stats-purchase-year" className="sr-only">
                        Año para desglose de compras
                      </label>
                      <Select
                        id="stats-purchase-year"
                        value={String(purchaseBreakdownYear)}
                        onChange={(event) => setPurchaseBreakdownYear(Number(event.target.value))}
                        disabled={acquisitionsLoading || purchaseYearOptions.length === 0}
                        className="h-9 min-w-[140px] rounded-md border-[#8e633d] bg-[#8e633d] !text-[#f8f1e5] hover:!bg-[#7c5534] dark:!border-[#8e633d] dark:!bg-[#8e633d] dark:!text-[#f8f1e5]"
                      >
                        {purchaseYearOptions.map((y) => (
                          <option key={y} value={y}>
                            {y}
                          </option>
                        ))}
                      </Select>
                    </div>
                  </div>
                  <p className="mt-2 text-center text-sm text-[#5a2f1f]">
                    En <strong>{purchaseBreakdownYear}</strong>:{" "}
                    <span className="font-['Fraunces',serif]">{purchaseMonthlyForYear.yearBookTotal}</span> compras
                    {purchaseMonthlyForYear.yearSpentTotal > 0 && (
                      <>
                        {" "}
                        · <span className="font-['Fraunces',serif]">{formatMoneyEur(purchaseMonthlyForYear.yearSpentTotal)}</span>
                      </>
                    )}
                  </p>
                  <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6 lg:grid-cols-12">
                    {monthLabels.map((label, idx) => {
                      const count = purchaseMonthlyForYear.counts[idx] ?? 0;
                      const amount = purchaseMonthlyForYear.amounts[idx] ?? 0;
                      const bg = spendColorByRatio(amount, purchaseMonthlyForYear.maxAmount);
                      return (
                        <div key={label} className="rounded-sm border border-[#c4a27b]/55 bg-[#f5ecde]/90 p-1.5 text-center">
                          <p className="text-[9px] font-semibold uppercase tracking-[0.06em] text-[#7a573c]">{label}</p>
                          <div className="my-1 h-10 overflow-hidden rounded-sm border border-[#c4a27b]/40 bg-[#efe3cd]">
                            <div className="h-full w-full transition-colors" style={{ backgroundColor: bg }} />
                          </div>
                          <p className="font-['Fraunces',serif] text-base leading-none text-[#5a2f1f]">{count}</p>
                          <p className="mt-0.5 text-[9px] leading-tight text-[#8e633d]">
                            {formatMoneyShortEur(amount, count > 0)}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2 border-t border-[#c4a27b]/50 bg-[#f5ecde]/60 px-4 py-3 text-[11px] leading-snug text-[#7a573c]">
                  {acquisitionsError && <p className="text-rose-800">{acquisitionsError}</p>}
                  {!acquisitionsError && purchaseStats.totalAcquisitions > 0 && purchaseStats.parsedPricesCount === 0 && (
                    <p>
                      Añade un precio reconocible (por ejemplo <span className="font-mono text-[#5a2f1f]">14,90 €</span>) al marcar
                      compras en la lista de deseos para ver totales y el desglose por mes.
                    </p>
                  )}
                  {!acquisitionsError && purchaseStats.avgPerPurchase !== null && (
                    <p>
                      Media por compra con precio:{" "}
                      <strong className="text-[#5a2f1f]">{formatMoneyEur(purchaseStats.avgPerPurchase)}</strong>
                    </p>
                  )}
                  <p>
                    <Link to="/wishlist" className="font-semibold text-[#8e633d] underline-offset-2 hover:underline">
                      Ir a la lista de deseos
                    </Link>
                  </p>
                </div>
              </article>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
