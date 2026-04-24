// Página principal con listado, búsqueda y filtros de la biblioteca.
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { BookOpen, Bookmark, Building2, CalendarDays, ChevronLeft, ChevronRight, Clock3, Heart, MessageSquareText, PencilLine, Quote, Star, Tags, ThumbsUp, X } from "lucide-react";
import { createReadingSession, deleteBook, getBookById, getReadableErrorMessage, getReadingSessions, getWishlistAcquisitions, updateBook } from "../api/client";
import { BookList } from "../components/BookList";
import { Alert } from "../components/ui/alert";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Select } from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
import { useBooksContext } from "../context/BooksContext";
import { useBookFilters } from "../hooks/useBookFilters";
import { Book, ReadingStatus } from "../types/book";
import { ReadingSession } from "../types/readingSession";
import { WishlistAcquisition } from "../types/wishlist";
import { capitalizeFirst } from "../utils/textCase";

export const LibraryPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { books, loading, error, reloadBooks, upsertBook } = useBooksContext();
  const isPreviewOnly = (location.state as { previewOnly?: boolean } | null)?.previewOnly === true;
  const { search, setSearch, status, setStatus, sortBy, setSortBy, filteredBooks } = useBookFilters(books);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [activeGenre, setActiveGenre] = useState<string | null>(null);
  const [activeShelf, setActiveShelf] = useState<"todos" | "pendiente" | "leido" | "leyendo" | "favoritos">("todos");
  const [previewBookId, setPreviewBookId] = useState<string | null>(null);
  const [previewBook, setPreviewBook] = useState<Book | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewTab, setPreviewTab] = useState<"info" | "resena" | "similares">("info");
  const [isClosingPreview, setIsClosingPreview] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isMarkPageOpen, setIsMarkPageOpen] = useState(false);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [markPageInput, setMarkPageInput] = useState("");
  const [markPageError, setMarkPageError] = useState<string | null>(null);
  const [reviewDraft, setReviewDraft] = useState("");
  const [ratingDraft, setRatingDraft] = useState(0);
  const [readAtDraft, setReadAtDraft] = useState("");
  const [timesReadDraft, setTimesReadDraft] = useState("1ª vez");
  const [favoriteQuoteDraft, setFavoriteQuoteDraft] = useState("");
  const [reviewTagsDraft, setReviewTagsDraft] = useState<string[]>([]);
  const [reviewTagInput, setReviewTagInput] = useState("");
  const [recommendDraft, setRecommendDraft] = useState<"si" | "depende" | "no">("si");
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [isSavingMarkPage, setIsSavingMarkPage] = useState(false);
  const [isSavingStatus, setIsSavingStatus] = useState(false);
  const [isSavingReview, setIsSavingReview] = useState(false);
  const [isShowingAllCollection, setIsShowingAllCollection] = useState(false);
  const [recentAcquisitions, setRecentAcquisitions] = useState<WishlistAcquisition[]>([]);
  const [acquisitionsError, setAcquisitionsError] = useState<string | null>(null);
  const [isReadAtPickerOpen, setIsReadAtPickerOpen] = useState(false);
  const [isTagDialogOpen, setIsTagDialogOpen] = useState(false);
  const [activeTagFilter, setActiveTagFilter] = useState<string | null>(null);
  const [readAtViewMonth, setReadAtViewMonth] = useState<Date>(new Date());
  const [readingSessionsByBook, setReadingSessionsByBook] = useState<Record<string, ReadingSession[]>>({});
  const readAtPickerRef = useRef<HTMLDivElement | null>(null);
  const acquisitionsTrackRef = useRef<HTMLDivElement | null>(null);
  const formatReadAtLabel = (value?: string) => {
    if (!value) return "—";
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
    }
    return value;
  };
  const monthNameLabel = (date: Date) =>
    date.toLocaleDateString("es-ES", { month: "long", year: "numeric" });
  const parseIsoDate = (value: string): Date | null => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
    const [y, m, d] = value.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    if (Number.isNaN(date.getTime())) return null;
    if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return null;
    return date;
  };
  const toIsoDate = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };
  const buildCalendarCells = (monthDate: Date): Array<Date | null> => {
    const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
    const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
    const startOffset = (monthStart.getDay() + 6) % 7; // lunes como primer día
    const cells: Array<Date | null> = [];
    for (let i = 0; i < startOffset; i += 1) cells.push(null);
    for (let d = 1; d <= monthEnd.getDate(); d += 1) {
      cells.push(new Date(monthDate.getFullYear(), monthDate.getMonth(), d));
    }
    while (cells.length < 42) cells.push(null);
    return cells;
  };
  const previewCloseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nowReadingBooks = useMemo(
    () =>
      books
        .filter((book) => book.status === "leyendo")
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
    [books]
  );
  const readCount = useMemo(() => books.filter((book) => book.status === "leido").length, [books]);
  const averageRating = useMemo(() => {
    const rated = books.filter(
      (book) => book.status === "leido" && typeof book.rating === "number" && (book.rating ?? 0) > 0
    );
    if (rated.length === 0) return "0.0";
    const total = rated.reduce((acc, item) => acc + (item.rating ?? 0), 0);
    return (total / rated.length).toFixed(1);
  }, [books]);
  const latestYear = useMemo(() => {
    const years = books
      .map((book) => new Date(book.updatedAt).getFullYear())
      .filter((year) => Number.isFinite(year));
    return years.length > 0 ? Math.max(...years) : new Date().getFullYear();
  }, [books]);
  const recentReviews = useMemo(
    () =>
      books
        .filter((book) => book.status === "leido" && book.review && book.review.trim().length > 0)
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 3),
    [books]
  );
  const genres = useMemo(() => {
    const counts = new Map<string, number>();
    books.forEach((book) => {
      const normalized = book.genre.trim();
      if (!normalized) return;
      counts.set(normalized, (counts.get(normalized) ?? 0) + 1);
    });
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "es"));
  }, [books]);
  const shelfFilteredBooks = useMemo(() => {
    if (activeShelf === "todos") return filteredBooks;
    if (activeShelf === "favoritos") return filteredBooks.filter((book) => book.isFavorite);
    return filteredBooks.filter((book) => book.status === activeShelf);
  }, [activeShelf, filteredBooks]);
  const visibleBooks = useMemo(() => {
    if (!activeGenre) return shelfFilteredBooks;
    return shelfFilteredBooks.filter((book) => book.genre.localeCompare(activeGenre, "es", { sensitivity: "base" }) === 0);
  }, [activeGenre, shelfFilteredBooks]);
  const similarBooks = useMemo(() => {
    if (!previewBook) return [];
    const previewTags = (previewBook.reviewTags ?? [])
      .map((tag) => tag.trim().toLocaleLowerCase("es"))
      .filter(Boolean);
    const previewTagSet = new Set(previewTags);

    return books
      .filter((book) => book.id !== previewBook.id)
      .map((book) => {
        const sameGenre = book.genre.localeCompare(previewBook.genre, "es", { sensitivity: "base" }) === 0;
        const sharedTagsCount = (book.reviewTags ?? []).reduce((acc, tag) => {
          const normalized = tag.trim().toLocaleLowerCase("es");
          return normalized && previewTagSet.has(normalized) ? acc + 1 : acc;
        }, 0);
        return { book, sameGenre, sharedTagsCount };
      })
      .filter((item) => item.sameGenre || item.sharedTagsCount > 0)
      .sort((a, b) => {
        if (b.sharedTagsCount !== a.sharedTagsCount) return b.sharedTagsCount - a.sharedTagsCount;
        if (a.sameGenre !== b.sameGenre) return Number(b.sameGenre) - Number(a.sameGenre);
        return new Date(b.book.updatedAt).getTime() - new Date(a.book.updatedAt).getTime();
      })
      .slice(0, 6)
      .map((item) => item.book);
  }, [books, previewBook]);
  const booksWithActiveTag = useMemo(() => {
    if (!activeTagFilter) return [];
    const normalizedTag = activeTagFilter.trim().toLocaleLowerCase("es");
    if (!normalizedTag) return [];
    return books
      .filter((book) => {
        if (previewBook && book.id === previewBook.id) return false;
        return (book.reviewTags ?? []).some(
          (tag) => tag.trim().toLocaleLowerCase("es") === normalizedTag
        );
      })
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [activeTagFilter, books, previewBook]);
  const previewVisibleBooks = useMemo(() => visibleBooks.slice(0, 12), [visibleBooks]);
  const collectionBooks = isShowingAllCollection ? visibleBooks : previewVisibleBooks;

  const handleDeleteBook = async (id: string) => {
    if (deletingId !== null) return;
    try {
      setDeleteError(null);
      setDeletingId(id);
      await deleteBook(id);
      await reloadBooks();
    } catch (err) {
      setDeleteError(getReadableErrorMessage(err, "No se pudo eliminar el libro. Inténtalo de nuevo."));
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    const loadPreview = async () => {
      if (!previewBookId) {
        setPreviewBook(null);
        return;
      }
      try {
        setPreviewLoading(true);
        const data = await getBookById(previewBookId);
        setPreviewBook(data);
      } finally {
        setPreviewLoading(false);
      }
    };
    void loadPreview();
  }, [previewBookId]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const previewId = params.get("preview");
    if (!previewId) return;
    setPreviewTab("info");
    setPreviewBookId(previewId);
  }, [location.search]);

  useEffect(() => {
    return () => {
      if (previewCloseTimeoutRef.current) {
        clearTimeout(previewCloseTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isReadAtPickerOpen) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!readAtPickerRef.current?.contains(event.target as Node)) {
        setIsReadAtPickerOpen(false);
      }
    };
    window.addEventListener("mousedown", onPointerDown);
    return () => window.removeEventListener("mousedown", onPointerDown);
  }, [isReadAtPickerOpen]);

  useEffect(() => {
    const loadAcquisitions = async () => {
      try {
        setAcquisitionsError(null);
        const data = await getWishlistAcquisitions();
        setRecentAcquisitions(data);
      } catch (err) {
        setRecentAcquisitions([]);
        setAcquisitionsError(getReadableErrorMessage(err, "No se pudieron cargar las adquisiciones."));
      }
    };
    void loadAcquisitions();
  }, []);

  useEffect(() => {
    if (!previewBookId) return;
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
    };
  }, [previewBookId]);

  useEffect(() => {
    if (previewBookId) return;
    setIsTagDialogOpen(false);
    setActiveTagFilter(null);
  }, [previewBookId]);

  const closePreview = () => {
    if (!previewBookId || isClosingPreview) return;
    setIsClosingPreview(true);
    previewCloseTimeoutRef.current = setTimeout(() => {
      setPreviewBookId(null);
      setIsClosingPreview(false);
      if (isPreviewOnly) {
        navigate(-1);
        previewCloseTimeoutRef.current = null;
        return;
      }
      const params = new URLSearchParams(location.search);
      if (params.has("preview")) {
        params.delete("preview");
        navigate(
          {
            pathname: location.pathname,
            search: params.toString() ? `?${params.toString()}` : ""
          },
          { replace: true }
        );
      }
      previewCloseTimeoutRef.current = null;
    }, 260);
  };

  const confirmDeleteFromPreview = async () => {
    if (!previewBook) return;
    setIsDeleteConfirmOpen(false);
    await handleDeleteBook(previewBook.id);
    closePreview();
  };

  const toggleFavorite = async () => {
    if (!previewBook) return;
    try {
      const updated = await updateBook(previewBook.id, { isFavorite: !previewBook.isFavorite });
      setPreviewBook(updated);
      upsertBook(updated);
    } catch {
      // no-op for now; keep silent to avoid noisy UX
    }
  };

  const setPreviewStatus = async (nextStatus: ReadingStatus) => {
    if (!previewBook || isSavingStatus) return;
    if (previewBook.status === nextStatus) return;
    const payload: Partial<Book> & { status: ReadingStatus } = { status: nextStatus };
    if (nextStatus === "leido") {
      payload.progress = 100;
      if (typeof previewBook.pages === "number" && previewBook.pages > 0) {
        payload.currentPage = previewBook.pages;
        payload.lastPageMarkedAt = new Date().toISOString();
      }
    } else if (nextStatus === "pendiente") {
      payload.progress = 0;
      payload.currentPage = 0;
      payload.lastPageMarkedAt = undefined;
    } else if ((previewBook.progress ?? 0) <= 0) {
      payload.progress = 1;
    }

    try {
      setIsSavingStatus(true);
      const updated = await updateBook(previewBook.id, payload);
      setPreviewBook(updated);
      upsertBook(updated);
    } finally {
      setIsSavingStatus(false);
    }
  };

  const openMarkPageDialog = () => {
    if (!previewBook) return;
    if (previewBook.status !== "leyendo") return;
    setMarkPageError(null);
    setMarkPageInput(String(previewBook.currentPage ?? 0));
    setIsMarkPageOpen(true);
  };

  const openReviewDialog = () => {
    if (!previewBook) return;
    setReviewError(null);
    setReviewDraft(previewBook.review ?? "");
    setRatingDraft(previewBook.rating ?? 0);
    setReadAtDraft(previewBook.readAt ?? "");
    setTimesReadDraft(previewBook.timesRead ?? "1ª vez");
    setFavoriteQuoteDraft(previewBook.favoriteQuote ?? "");
    setReviewTagsDraft(previewBook.reviewTags ?? []);
    setReviewTagInput("");
    setRecommendDraft(previewBook.wouldRecommend ?? "si");
    setReadAtViewMonth(parseIsoDate(previewBook.readAt ?? "") ?? new Date());
    setIsReadAtPickerOpen(false);
    setIsReviewDialogOpen(true);
  };

  const saveReview = async () => {
    if (!previewBook || isSavingReview) return;
    setIsSavingReview(true);
    setReviewError(null);
    try {
      const updated = await updateBook(previewBook.id, {
        review: reviewDraft.trim(),
        rating: ratingDraft,
        readAt: readAtDraft.trim(),
        timesRead: timesReadDraft.trim(),
        favoriteQuote: favoriteQuoteDraft.trim(),
        reviewTags: reviewTagsDraft,
        wouldRecommend: recommendDraft
      });
      setPreviewBook(updated);
      upsertBook(updated);
      setIsReviewDialogOpen(false);
    } catch (err) {
      setReviewError(getReadableErrorMessage(err, "No se pudo guardar la reseña. Inténtalo de nuevo."));
    } finally {
      setIsSavingReview(false);
    }
  };

  const addReviewTag = () => {
    const nextTag = reviewTagInput.trim();
    if (!nextTag) return;
    if (nextTag.length > 40) {
      setReviewError("Cada etiqueta debe tener como máximo 40 caracteres.");
      return;
    }

    setReviewTagsDraft((current) => {
      const alreadyExists = current.some((item) => item.localeCompare(nextTag, "es", { sensitivity: "base" }) === 0);
      if (alreadyExists) return current;
      return [...current, nextTag];
    });
    setReviewTagInput("");
    setReviewError(null);
  };

  const removeReviewTag = (tag: string) => {
    setReviewTagsDraft((current) => current.filter((item) => item !== tag));
  };

  const scrollAcquisitions = (direction: "left" | "right") => {
    const container = acquisitionsTrackRef.current;
    if (!container) return;
    const firstCard = container.querySelector("article");
    const styles = window.getComputedStyle(container);
    const gap = Number.parseFloat(styles.columnGap || styles.gap || "0") || 0;
    const cardWidth = firstCard instanceof HTMLElement ? firstCard.offsetWidth : Math.max(260, Math.round(container.clientWidth / 4));
    const amount = Math.max(1, cardWidth + gap);
    container.scrollBy({
      left: direction === "right" ? amount : -amount,
      behavior: "smooth"
    });
  };

  const openTagDialog = (tag: string) => {
    setActiveTagFilter(tag);
    setIsTagDialogOpen(true);
  };

  const recentMarkHistory = useMemo(() => {
    if (!previewBook) return [];
    const sessions = (readingSessionsByBook[previewBook.id] ?? []).slice(0, 3);
    if (sessions.length > 0) {
      return sessions.map((session) => {
        const date = new Date(session.recordedAt);
        return {
          date,
          label: date.toLocaleString("es-ES", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit"
          }),
          page: session.currentPage
        };
      });
    }
    if (typeof previewBook.currentPage === "number" && previewBook.lastPageMarkedAt) {
      const date = new Date(previewBook.lastPageMarkedAt);
      return [{
        date,
        label: date.toLocaleString("es-ES", {
          day: "2-digit",
          month: "short",
          hour: "2-digit",
          minute: "2-digit"
        }),
        page: previewBook.currentPage
      }];
    }
    return [];
  }, [previewBook, readingSessionsByBook]);

  useEffect(() => {
    const loadReadingSessionsByBook = async () => {
      if (!isMarkPageOpen) return;
      try {
        const sessions = await getReadingSessions();
        const grouped = sessions.reduce<Record<string, ReadingSession[]>>((acc, session) => {
          if (!acc[session.bookId]) acc[session.bookId] = [];
          acc[session.bookId].push(session);
          return acc;
        }, {});
        Object.values(grouped).forEach((list) => {
          list.sort(
            (a, b) =>
              new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime() ||
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        });
        setReadingSessionsByBook(grouped);
      } catch {
        // Ignore history refresh errors in mark-page dialog.
      }
    };
    void loadReadingSessionsByBook();
  }, [isMarkPageOpen]);

  const saveMarkedPage = async () => {
    if (!previewBook || isSavingMarkPage) return;
    if (previewBook.status !== "leyendo") {
      setMarkPageError("Solo puedes marcar página cuando el libro está en estado Leyendo.");
      return;
    }
    const parsed = Number(markPageInput);
    const maxPages = previewBook.pages ?? 20000;
    if (!Number.isInteger(parsed) || parsed < 0 || parsed > maxPages) {
      setMarkPageError(`Introduce una página válida entre 0 y ${maxPages}.`);
      return;
    }

    setIsSavingMarkPage(true);
    setMarkPageError(null);
    const nowIso = new Date().toISOString();
    const hasPages = typeof previewBook.pages === "number" && previewBook.pages > 0;
    const computedProgress = hasPages
      ? Math.round(Math.max(0, Math.min(100, (parsed / previewBook.pages!) * 100)))
      : previewBook.progress ?? 0;
    const nextStatus = hasPages && parsed >= previewBook.pages!
      ? "leido"
      : parsed > 0
        ? "leyendo"
        : previewBook.status;

    try {
      const previousPage = previewBook.currentPage ?? null;
      const updated = await updateBook(previewBook.id, {
        currentPage: parsed,
        lastPageMarkedAt: nowIso,
        progress: computedProgress,
        status: nextStatus
      });
      if (previousPage !== parsed) {
        const createdSession = await createReadingSession({
          bookId: previewBook.id,
          previousPage: previousPage ?? undefined,
          currentPage: parsed,
          recordedAt: nowIso
        });
        setReadingSessionsByBook((current) => {
          const existing = current[previewBook.id] ?? [];
          const nextForBook = [createdSession, ...existing].slice(0, 20);
          return { ...current, [previewBook.id]: nextForBook };
        });
      }
      setPreviewBook(updated);
      upsertBook(updated);
      setIsMarkPageOpen(false);
    } catch (err) {
      setMarkPageError(
        getReadableErrorMessage(err, "No se pudo guardar la marca de página. Inténtalo de nuevo.")
      );
    } finally {
      setIsSavingMarkPage(false);
    }
  };

  return (
    <section className={isPreviewOnly ? "relative z-[45]" : "relative min-h-full space-y-6 bg-transparent pl-1 pr-4 py-2 text-amber-50 sm:pl-2 sm:pr-6"}>
      {!isPreviewOnly && (
      <div className={`grid gap-5 lg:grid-cols-[260px_1fr] ${previewBookId ? "pointer-events-none select-none" : ""}`}>
        <aside className="space-y-4">
          <div className="overflow-hidden rounded-xl border border-[#c69253] bg-[#e9dcc4] text-[#4d311d]">
            <p className="border-b border-[#c89c33] bg-[#1a0b06]/90 px-4 py-3 text-xs font-semibold tracking-[0.18em] text-[#e8cf9f]">📚 MI BIBLIOTECA</p>
            <div className="grid grid-cols-2 gap-3 p-4 text-center">
              <div>
                <p className="font-['Fraunces',serif] text-3xl">{books.length}</p>
                <p className="text-[11px] uppercase tracking-[0.12em]">Libros</p>
              </div>
              <div>
                <p className="font-['Fraunces',serif] text-3xl">{readCount}</p>
                <p className="text-[11px] uppercase tracking-[0.12em]">Leídos</p>
              </div>
              <div>
                <p className="font-['Fraunces',serif] text-3xl">{averageRating}</p>
                <p className="text-[11px] uppercase tracking-[0.12em]">Valoración</p>
              </div>
              <div>
                <p className="font-['Fraunces',serif] text-3xl">{latestYear}</p>
                <p className="text-[11px] uppercase tracking-[0.12em]">Mejor año</p>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-[#c69253] bg-[#e9dcc4] text-[#4d311d]">
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
          </div>

          <div className="overflow-hidden rounded-xl border border-[#c69253] bg-[#e9dcc4] text-[#4d311d]">
            <p className="border-b border-[#c89c33] bg-[#1a0b06]/90 px-4 py-3 text-xs font-semibold tracking-[0.18em] text-[#e8cf9f]">🗂️ ESTANTES</p>
            <ul className="divide-y divide-[#dcc8a7] text-sm">
              <li className="flex items-center justify-between px-4 py-2.5">
                <button
                  type="button"
                  onClick={() => setActiveShelf("todos")}
                  className={`inline-flex items-center gap-2 transition hover:underline ${activeShelf === "todos" ? "font-semibold underline" : ""}`}
                >
                  <BookOpen className="h-3.5 w-3.5" />Todos
                </button>
                <span className="font-semibold text-[#6f4b2e]">{books.length}</span>
              </li>
              <li className="flex items-center justify-between px-4 py-2.5">
                <button
                  type="button"
                  onClick={() => setActiveShelf("pendiente")}
                  className={`inline-flex items-center gap-2 transition hover:underline ${activeShelf === "pendiente" ? "font-semibold underline" : ""}`}
                >
                  <BookOpen className="h-3.5 w-3.5" />Pendientes
                </button>
                <span className="font-semibold text-[#6f4b2e]">{books.filter((b) => b.status === "pendiente").length}</span>
              </li>
              <li className="flex items-center justify-between px-4 py-2.5">
                <button
                  type="button"
                  onClick={() => setActiveShelf("leido")}
                  className={`inline-flex items-center gap-2 transition hover:underline ${activeShelf === "leido" ? "font-semibold underline" : ""}`}
                >
                  <Bookmark className="h-3.5 w-3.5" />Leídos
                </button>
                <span className="font-semibold text-[#6f4b2e]">{readCount}</span>
              </li>
              <li className="flex items-center justify-between px-4 py-2.5">
                <button
                  type="button"
                  onClick={() => setActiveShelf("leyendo")}
                  className={`inline-flex items-center gap-2 transition hover:underline ${activeShelf === "leyendo" ? "font-semibold underline" : ""}`}
                >
                  <Clock3 className="h-3.5 w-3.5" />En progreso
                </button>
                <span className="font-semibold text-[#6f4b2e]">{books.filter((b) => b.status === "leyendo").length}</span>
              </li>
              <li className="flex items-center justify-between px-4 py-2.5">
                <button
                  type="button"
                  onClick={() => setActiveShelf("favoritos")}
                  className={`inline-flex items-center gap-2 transition hover:underline ${activeShelf === "favoritos" ? "font-semibold underline" : ""}`}
                >
                  <Heart className="h-3.5 w-3.5" />Favoritos
                </button>
                <span className="font-semibold text-[#6f4b2e]">{books.filter((b) => b.isFavorite).length}</span>
              </li>
            </ul>
          </div>
          <div className="overflow-hidden rounded-xl border border-[#c69253] bg-[#e9dcc4] text-[#4d311d]">
            <p className="border-b border-[#c89c33] bg-[#1a0b06]/90 px-4 py-3 text-xs font-semibold tracking-[0.18em] text-[#e8cf9f]">🏷️ GÉNEROS</p>
            {genres.length === 0 ? (
              <p className="px-4 py-3 text-sm">Sin géneros todavía.</p>
            ) : (
              <ul className="divide-y divide-[#dcc8a7] text-sm">
                <li className="flex items-center justify-between px-4 py-2.5">
                  <button
                    type="button"
                    onClick={() => setActiveGenre(null)}
                    className={`line-clamp-1 transition hover:underline ${activeGenre === null ? "font-semibold text-[#5a2f1f] underline" : ""}`}
                  >
                    Todos
                  </button>
                  <span className="font-semibold text-[#6f4b2e]">{books.length}</span>
                </li>
                {genres.map(([genre, count]) => (
                  <li key={genre} className="flex items-center justify-between px-4 py-2.5">
                    <button
                      type="button"
                      onClick={() => setActiveGenre((current) => (current === genre ? null : genre))}
                      className={`line-clamp-1 transition hover:underline ${
                        activeGenre === genre ? "font-semibold text-[#5a2f1f] underline" : ""
                      }`}
                    >
                      {genre}
                    </button>
                    <span className="font-semibold text-[#6f4b2e]">{count}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>

        <div className="space-y-4">
          <div className="rounded-md border border-amber-700/60 bg-[#e9dcc4] p-3">
            <div className="grid gap-2 sm:grid-cols-[1fr_170px_170px_auto]">
              <Input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por título, autor, editorial o género..."
                className="border-[#b08a63] bg-[#f8f1e5] text-[#4d311d] placeholder:text-[#8d6d4d]"
              />
              <Select value={status} onChange={(event) => setStatus(event.target.value as typeof status)} className="border-[#8e633d] bg-[#8e633d] text-[#f8f1e5] hover:bg-[#7c5534] dark:border-[#8e633d] dark:bg-[#8e633d] dark:text-[#f8f1e5]">
                <option value="todos">Todos</option>
                <option value="pendiente">Pendiente</option>
                <option value="leyendo">Leyendo</option>
                <option value="leido">Leído</option>
              </Select>
              <Select value={sortBy} onChange={(event) => setSortBy(event.target.value as typeof sortBy)} className="border-[#8e633d] bg-[#8e633d] text-[#f8f1e5] hover:bg-[#7c5534] dark:border-[#8e633d] dark:bg-[#8e633d] dark:text-[#f8f1e5]">
                <option value="recientes">Más recientes</option>
                <option value="titulo">Título (A-Z)</option>
                <option value="autor">Autor (A-Z)</option>
                <option value="genero">Género (A-Z)</option>
                <option value="valoracion">Valoración</option>
              </Select>
              <Link to="/books/new">
                <Button size="default" className="h-8 border border-[#8e633d] bg-[#8e633d] px-4 font-semibold text-[#f8f1e5] hover:bg-[#7c5534]">
                  + Añadir libro
                </Button>
              </Link>
            </div>
          </div>

          {deleteError && (
            <Alert variant="destructive" className="flex flex-wrap items-center justify-between gap-3">
              <span>{deleteError}</span>
              <Button variant="outline" size="sm" onClick={() => setDeleteError(null)} className="shrink-0">
                Cerrar
              </Button>
            </Alert>
          )}

          <div className="border-t border-[#d7b06f] pt-4">
            <div className="mb-4 flex items-center justify-between gap-2">
              <p className="font-['Fraunces',serif] text-2xl text-[#5a2f1f] dark:text-amber-100">✦ Colección</p>
              <button
                type="button"
                onClick={() => setIsShowingAllCollection((current) => !current)}
                className="text-xs text-[#8e633d] transition hover:underline dark:text-amber-200/80"
              >
                {isShowingAllCollection ? "Ver menos ←" : "Ver todos →"}
              </button>
            </div>
            {loading && <p className="rt-body-copy text-amber-100/90">Cargando libros...</p>}
            {error && <Alert variant="destructive">{error}</Alert>}
            {!loading && !error && (
              <BookList
                books={collectionBooks}
                onOpenPreview={(id) => {
                  if (previewCloseTimeoutRef.current) {
                    clearTimeout(previewCloseTimeoutRef.current);
                    previewCloseTimeoutRef.current = null;
                  }
                  setIsClosingPreview(false);
                  setPreviewTab("info");
                  setPreviewBookId(id);
                  const params = new URLSearchParams(location.search);
                  params.set("preview", id);
                  navigate(
                    {
                      pathname: location.pathname,
                      search: `?${params.toString()}`
                    },
                    { replace: true }
                  );
                }}
              />
            )}
          </div>
          <div className="border-t border-[#d7b06f] pt-4">
            <div className="mb-4 flex items-center justify-between gap-2">
              <p className="font-['Fraunces',serif] text-2xl text-[#5a2f1f] dark:text-amber-100">✦ Últimas reseñas</p>
              <Link to="/reviews" className="text-xs text-[#8e633d] transition hover:underline dark:text-amber-200/80">
                Ver todas →
              </Link>
            </div>
            {recentReviews.length === 0 ? (
              <div className="rounded-md border border-amber-700/60 bg-[#e9dcc4] p-4 text-sm text-[#4d311d]">
                Aún no hay reseñas publicadas.
              </div>
            ) : (
              <div className="space-y-3">
                {recentReviews.map((book) => (
                  <article key={book.id} className="rounded-md border border-amber-700/60 bg-[#e9dcc4] p-4 text-[#4d311d]">
                    <p className="font-['Fraunces',serif] text-xl">{book.title}</p>
                    <p className="text-xs italic text-[#7a573c]">{book.author}</p>
                    <p className="mt-2 border-t border-[#c4a27b]/70 pt-2 line-clamp-3 text-sm leading-relaxed">"{book.review}"</p>
                  </article>
                ))}
              </div>
            )}
          </div>
          <div className="border-t border-[#d7b06f] pt-4">
            <div className="mb-4 flex items-center justify-between gap-2">
              <p className="font-['Fraunces',serif] text-2xl text-[#5a2f1f] dark:text-amber-100">✦ Últimas adquisiciones</p>
              <Link to="/wishlist" className="text-xs text-[#8e633d] transition hover:underline dark:text-amber-200/80">
                Ver lista de deseos →
              </Link>
            </div>
            {acquisitionsError ? (
              <Alert variant="destructive">{acquisitionsError}</Alert>
            ) : recentAcquisitions.length === 0 ? (
              <div className="rounded-md border border-amber-700/60 bg-[#e9dcc4] p-4 text-sm text-[#4d311d]">
                Todavía no tienes adquisiciones recientes.
              </div>
            ) : (
              <div className="relative px-0 sm:px-8">
                <button
                  type="button"
                  onClick={() => scrollAcquisitions("left")}
                  className="absolute left-1 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-[#8e633d] bg-[#e9dcc4] text-[#6f4b2e] shadow sm:inline-flex"
                  aria-label="Desplazar adquisiciones a la izquierda"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <div
                  ref={acquisitionsTrackRef}
                  className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                >
                  {recentAcquisitions.map((item) => (
                    <article
                      key={item.id}
                      className="w-[88%] flex-none snap-start rounded-md border border-amber-700/60 bg-[#e9dcc4] p-4 text-[#4d311d] sm:w-[calc((100%-2.25rem)/4)]"
                    >
                      <p className="font-['Fraunces',serif] text-xl">{item.title}</p>
                      <p className="text-xs italic text-[#7a573c]">{item.author}</p>
                      <p className="mt-2 text-sm">
                        <span className="font-semibold">Tienda:</span> {item.store || "Sin tienda"}
                      </p>
                      <p className="text-sm">
                        <span className="font-semibold">Precio:</span> {item.price || "Sin precio"}
                      </p>
                      <p className="mt-1 text-[11px] uppercase tracking-[0.12em] text-[#7a573c]">
                        Comprado el {new Date(item.purchasedAt).toLocaleDateString("es-ES")}
                      </p>
                    </article>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => scrollAcquisitions("right")}
                  className="absolute right-1 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-[#8e633d] bg-[#e9dcc4] text-[#6f4b2e] shadow sm:inline-flex"
                  aria-label="Desplazar adquisiciones a la derecha"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      )}
      {previewBookId && (
        <>
          <div
            className={`${isClosingPreview ? "animate-fade-out-soft" : "animate-fade-in-soft"} fixed left-0 top-0 z-40 h-[100dvh] w-[100vw] bg-black/45 backdrop-blur-[2px]`}
            onClick={closePreview}
            aria-hidden
          />
          <aside className={`${isClosingPreview ? "animate-slide-out-right-soft" : "animate-slide-in-right-soft"} fixed inset-y-0 right-0 z-50 flex w-full max-w-[600px] flex-col border-l-2 border-[#b78945] bg-[#f2e6d3] text-[#4d311d] shadow-2xl`}>
            <header
              className="relative border-b border-[#8f643f] bg-gradient-to-b from-[#3a1c11] via-[#2b140c] to-[#1a0b06] px-4 pb-5 pt-5 text-amber-50"
              style={{
                backgroundImage:
                  "radial-gradient(circle at center, rgba(199,157,79,0.2) 0 2px, transparent 2px), radial-gradient(circle at center, rgba(199,157,79,0.14) 0 1px, transparent 1px), linear-gradient(to bottom, rgba(58,28,17,0.96), rgba(26,11,6,0.98))",
                backgroundSize: "80px 80px, 80px 80px, 100% 100%",
                backgroundPosition: "0 0, 40px 40px, 0 0"
              }}
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-end gap-4">
                  <div className="h-28 w-[4.8rem] shrink-0 overflow-hidden border border-[#b78945] bg-[#6a3f1e] shadow-[0_10px_24px_-12px_rgba(0,0,0,0.8)] [transform:perspective(1000px)_rotateY(-6deg)]">
                    {previewBook?.coverUrl ? (
                      <img src={previewBook.coverUrl} alt={`Portada de ${previewBook.title}`} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center px-2 text-center text-xs text-amber-100/85">
                        {previewBook?.title ?? "Sin portada"}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 pb-1">
                    <h3 className="line-clamp-2 font-['Fraunces',serif] text-[2.15rem] leading-[1.05] text-[#f6ead8]">
                      {previewLoading ? "Cargando..." : previewBook?.title ?? "Libro"}
                    </h3>
                    <p className="mt-0.5 line-clamp-1 text-[1.35rem] italic text-[#d7b06f]">{previewBook?.author}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      <p className="text-base text-[#cf9f28]">
                        {"★".repeat(previewBook?.rating ?? 0)}
                        {"☆".repeat(Math.max(0, 5 - (previewBook?.rating ?? 0)))}
                      </p>
                      {previewBook?.isFavorite && (
                        <span className="inline-flex items-center rounded-sm border border-amber-500/60 bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-800">
                          <Heart className="mr-1 h-3 w-3 fill-rose-500 text-rose-500" />
                          Favorito
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={closePreview}
                  className="inline-flex h-8 w-8 items-center justify-center border border-[#b78945] bg-[#3a1315]/70 text-[#cf9f28] hover:bg-[#220a0c]"
                  aria-label="Cerrar panel"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-0 border-t border-[#b78945]/55 pt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#c89c4f]">
                <button
                  type="button"
                  onClick={() => setPreviewTab("info")}
                  className={`px-2 py-1.5 text-left ${
                    previewTab === "info"
                      ? "text-[#f2cf85]"
                      : "text-[#b78945]"
                  }`}
                >
                  <span className={previewTab === "info" ? "border-b border-[#e0b45f] pb-0.5" : ""}>
                    Información
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTab("resena")}
                  className={`px-2 py-1.5 text-left ${
                    previewTab === "resena"
                      ? "text-[#f2cf85]"
                      : "text-[#b78945]"
                  }`}
                >
                  <span className={previewTab === "resena" ? "border-b border-[#e0b45f] pb-0.5" : ""}>
                    Mi reseña
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTab("similares")}
                  className={`px-2 py-1.5 text-left ${
                    previewTab === "similares"
                      ? "text-[#f2cf85]"
                      : "text-[#b78945]"
                  }`}
                >
                  <span className={previewTab === "similares" ? "border-b border-[#e0b45f] pb-0.5" : ""}>
                    Similares
                  </span>
                </button>
              </div>
            </header>
            <div className="flex-1 overflow-y-auto p-5">
              {previewLoading ? (
                <p className="text-sm">Cargando información del libro...</p>
              ) : previewBook ? (
                previewTab === "info" ? (
                  <div className="space-y-4">
                    <div className="rounded-md bg-[#efe4d1] px-4 py-3 shadow-[0_6px_18px_-14px_rgba(90,47,31,0.55)]">
                      <div className="min-w-[210px]">
                        <p className="mb-2 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.12em] text-[#7a573c]">
                          <Bookmark className="h-3.5 w-3.5" />
                          Estado de lectura
                        </p>
                        <Select
                          value={previewBook.status}
                          onChange={(event) => void setPreviewStatus(event.target.value as ReadingStatus)}
                          disabled={isSavingStatus}
                          className="h-8 rounded-sm !border-[#8e633d] !bg-[#8e633d] !text-[#f8f1e5] text-xs font-semibold uppercase tracking-wide hover:!bg-[#7c5534] dark:!border-[#8e633d] dark:!bg-[#8e633d] dark:!text-[#f8f1e5]"
                        >
                          <option value="pendiente">Pendiente</option>
                          <option value="leyendo">Leyendo</option>
                          <option value="leido">Leído</option>
                        </Select>
                      </div>
                      {isSavingStatus && <span className="mt-2 inline-block text-xs text-[#7a573c]">Guardando estado...</span>}
                    </div>

                    <div className="rounded-md bg-[#efe4d1] px-4 py-3 shadow-[0_6px_18px_-14px_rgba(90,47,31,0.55)]">
                      <div className="mb-3 flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-[#b68e66]" />
                        <p className="text-[1.08rem] font-['Fraunces',serif] text-[#5a2f1f]">Detalles del libro</p>
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-5 text-sm">
                        <div className="border-b border-[#d8c1a1]/70 pb-2">
                          <p className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.12em] text-[#8b6a4f]">
                            <CalendarDays className="h-3.5 w-3.5" />
                            Año de publicación
                          </p>
                          <p className="mt-1 text-[1.03rem] font-semibold text-[#5a2f1f]">{previewBook.publicationYear ?? "—"}</p>
                        </div>
                        <div className="border-b border-[#d8c1a1]/70 pb-2">
                          <p className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.12em] text-[#8b6a4f]">
                            <BookOpen className="h-3.5 w-3.5" />
                            Páginas
                          </p>
                          <p className="mt-1 text-[1.03rem] font-semibold text-[#5a2f1f]">{previewBook.pages ?? "—"}</p>
                        </div>
                        <div className="border-b border-[#d8c1a1]/70 pb-2">
                          <p className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.12em] text-[#8b6a4f]">
                            <Tags className="h-3.5 w-3.5" />
                            Género
                          </p>
                          <p className="mt-1 text-[1.03rem] font-semibold text-[#5a2f1f]">{previewBook.genre}</p>
                        </div>
                        <div className="border-b border-[#d8c1a1]/70 pb-2">
                          <p className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.12em] text-[#8b6a4f]">
                            <Building2 className="h-3.5 w-3.5" />
                            Editorial
                          </p>
                          <p className="mt-1 text-[1.03rem] font-semibold text-[#5a2f1f]">{previewBook.publisher || "—"}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mx-2 rounded-md bg-[#f8f1e5] px-4 py-3 shadow-[0_6px_18px_-14px_rgba(90,47,31,0.6)]">
                      <p className="mb-2 text-[11px] uppercase tracking-[0.12em] text-[#7a573c]">Sinopsis</p>
                      <p className="text-[0.98rem] leading-relaxed text-[#5a3b24]">
                        {previewBook.synopsis?.trim() || "Todavía no has añadido una sinopsis para este libro."}
                      </p>
                    </div>
                  </div>
                ) : previewTab === "resena" ? (
                  <div className="space-y-3">
                    <div className="rounded-md bg-[#eadcc4] px-3 py-2 shadow-[0_6px_18px_-14px_rgba(90,47,31,0.45)]">
                      <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7a573c]">
                        <MessageSquareText className="h-3.5 w-3.5" />
                        Mi reseña
                      </p>
                    </div>

                    <div className="rounded-md bg-[#f3e8d8] p-3.5 shadow-[0_8px_20px_-16px_rgba(90,47,31,0.55)]">
                      <p className="text-[0.98rem] leading-relaxed text-[#5a3b24]">
                        {previewBook.review?.trim() || "Todavía no has escrito una reseña para este libro."}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-md bg-[#efe1ce] p-3.5 shadow-[0_8px_20px_-16px_rgba(90,47,31,0.5)]">
                        <p className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.12em] text-[#7a573c]">
                          <CalendarDays className="h-3.5 w-3.5" />
                          Leído en
                        </p>
                        <p className="mt-1 font-['Fraunces',serif] text-[1.12rem] leading-none text-[#5a2f1f]">
                          {formatReadAtLabel(previewBook.readAt)}
                        </p>
                      </div>
                      <div className="rounded-md bg-[#efe1ce] p-3.5 shadow-[0_8px_20px_-16px_rgba(90,47,31,0.5)]">
                        <p className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.12em] text-[#7a573c]">
                          <Clock3 className="h-3.5 w-3.5" />
                          Veces leído
                        </p>
                        <p className="mt-1 font-['Fraunces',serif] text-[1.12rem] leading-none text-[#5a2f1f]">
                          {previewBook.timesRead?.trim() || "—"}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-md bg-[#f3e8d8] p-3.5 shadow-[0_8px_20px_-16px_rgba(90,47,31,0.55)]">
                      <p className="mb-2 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.12em] text-[#7a573c]">
                        <Quote className="h-3.5 w-3.5" />
                        Frase o cita favorita
                      </p>
                      <p className="text-[1rem] italic leading-relaxed text-[#5a3b24]">
                        {previewBook.favoriteQuote?.trim() || "Todavía no has guardado una cita favorita."}
                      </p>
                    </div>

                    <div className="rounded-md bg-[#efe1ce] p-3.5 shadow-[0_8px_20px_-16px_rgba(90,47,31,0.5)]">
                      <p className="mb-2 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.12em] text-[#7a573c]">
                        <Tags className="h-3.5 w-3.5" />
                        Etiquetas temáticas
                      </p>
                      {previewBook.reviewTags && previewBook.reviewTags.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {previewBook.reviewTags.map((tag) => (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => openTagDialog(tag)}
                              className="rounded-sm border border-[#d0b188] bg-[#f5ecde] px-2 py-1 text-xs font-semibold text-[#8e633d]"
                              title={`Ver libros con etiqueta ${tag}`}
                            >
                              {tag}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-[#7a573c]">Sin etiquetas.</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <div className="rounded-md bg-[#f3e8d8] p-3.5 shadow-[0_8px_20px_-16px_rgba(90,47,31,0.55)]">
                        <p className="mb-1 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.12em] text-[#7a573c]">
                          <Star className="h-3.5 w-3.5" />
                          Valoración
                        </p>
                        <p className="text-[1.05rem] text-[#8e633d]">
                          {"★".repeat(previewBook.rating ?? 0)}
                          {"☆".repeat(Math.max(0, 5 - (previewBook.rating ?? 0)))}
                        </p>
                      </div>

                      <div className="rounded-md bg-[#f3e8d8] p-3.5 shadow-[0_8px_20px_-16px_rgba(90,47,31,0.55)]">
                        <p className="mb-1 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.12em] text-[#7a573c]">
                          <ThumbsUp className="h-3.5 w-3.5" />
                          Recomendación
                        </p>
                        <p className="text-[0.97rem] text-[#5a3b24]">
                          {previewBook.wouldRecommend === "si"
                            ? "👍 Sí, lo recomendaría"
                            : previewBook.wouldRecommend === "depende"
                              ? "🤔 Depende del lector"
                              : previewBook.wouldRecommend === "no"
                                ? "👎 No especialmente"
                                : "—"}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-[11px] uppercase tracking-[0.12em] text-[#7a573c]">Similares</p>
                    <p className="text-sm italic text-[#8e633d]">
                      Libros que podrían interesarte por género o etiquetas en común
                    </p>
                    {similarBooks.length === 0 ? (
                      <p className="rounded-md border border-[#c4a27b]/70 bg-[#efe4d1] p-3 text-sm leading-relaxed">
                        No hay más libros del mismo género en tu biblioteca.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {similarBooks.map((book, index) => (
                          <button
                            key={book.id}
                            type="button"
                            onClick={() => {
                              setPreviewTab("info");
                              setPreviewBookId(book.id);
                              const params = new URLSearchParams(location.search);
                              params.set("preview", book.id);
                              navigate(
                                {
                                  pathname: location.pathname,
                                  search: `?${params.toString()}`
                                },
                                { replace: true }
                              );
                            }}
                            className="rounded-sm border border-[#d3b98f] bg-[#e7d6bc] p-2 text-left transition hover:bg-[#dcc3a1]"
                          >
                            <span className="mb-2 block h-16 w-full overflow-hidden">
                              {book.coverUrl ? (
                                <img
                                  src={book.coverUrl}
                                  alt={`Portada de ${book.title}`}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <span
                                  className="flex h-full w-full items-center justify-center px-2 text-center text-xs font-semibold text-amber-50"
                                  style={{
                                    background:
                                      index % 3 === 0
                                        ? "linear-gradient(135deg, #2f5e24 0%, #183f1a 100%)"
                                        : index % 3 === 1
                                          ? "linear-gradient(135deg, #6b1d22 0%, #4d1218 100%)"
                                          : "linear-gradient(135deg, #16545a 0%, #0f3a3f 100%)"
                                  }}
                                >
                                  {book.title}
                                </span>
                              )}
                            </span>
                            <span className="block line-clamp-1 font-['Fraunces',serif] text-[1.04rem] text-[#5a2f1f]">
                              {book.title}
                            </span>
                            <span className="block line-clamp-1 text-xs italic text-[#8e633d]">
                              {(() => {
                                const sameGenre =
                                  book.genre.localeCompare(previewBook.genre, "es", { sensitivity: "base" }) === 0;
                                const previewTagSet = new Set(
                                  (previewBook.reviewTags ?? [])
                                    .map((tag) => tag.trim().toLocaleLowerCase("es"))
                                    .filter(Boolean)
                                );
                                const hasSharedTags = (book.reviewTags ?? []).some((tag) =>
                                  previewTagSet.has(tag.trim().toLocaleLowerCase("es"))
                                );
                                if (sameGenre && hasSharedTags) return "Género y etiquetas";
                                if (hasSharedTags) return "Etiquetas en común";
                                return "Mismo género";
                              })()}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )
              ) : (
                <p className="text-sm">No se pudo cargar este libro.</p>
              )}
            </div>
            <footer className="grid grid-cols-[1.2fr_1fr_1fr_1fr] gap-3 border-t border-[#8f643f] bg-[#e9dcc4] p-3">
              {previewTab === "resena" ? (
                <Button
                  size="sm"
                  onClick={openReviewDialog}
                  disabled={!previewBook}
                  className="h-10 w-full rounded-none border border-[#8e633d] bg-[#8e633d] px-3 text-[#f8f1e5] hover:bg-[#7c5534]"
                >
                  <PencilLine className="mr-2 h-3.5 w-3.5" />
                  Reseñar
                </Button>
              ) : (
                <Link to={previewBook ? `/books/${previewBook.id}/edit` : "#"}>
                  <Button
                    size="sm"
                    className="h-10 w-full rounded-none border border-[#8e633d] bg-[#8e633d] px-3 text-[#f8f1e5] hover:bg-[#7c5534]"
                  >
                    <PencilLine className="mr-2 h-3.5 w-3.5" />
                    Editar información
                  </Button>
                </Link>
              )}
              <Button
                size="sm"
                variant="outline"
                className="h-10 w-full rounded-none border-[#b08a63] bg-[#efe4d1] text-[#8e633d] hover:border-[#8e633d] hover:bg-[#dcbf98] hover:text-[#6f4b2e]"
                onClick={openMarkPageDialog}
                disabled={!previewBook || previewBook.status !== "leyendo"}
              >
                <Bookmark className="mr-1 h-3.5 w-3.5 text-rose-500" />
                Marcar página
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-10 w-full rounded-none border-[#b08a63] bg-[#efe4d1] text-[#8e633d] hover:border-[#8e633d] hover:bg-[#dcbf98] hover:text-[#6f4b2e]"
                onClick={() => void toggleFavorite()}
                disabled={!previewBook}
              >
                <Heart className={`mr-1 h-3.5 w-3.5 ${previewBook?.isFavorite ? "fill-rose-500 text-rose-500" : "text-rose-500"}`} />
                {previewBook?.isFavorite ? "Quitar favorito" : "Favoritos"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-10 w-full rounded-none border-rose-300 bg-[#efe4d1] text-rose-700 hover:border-rose-500 hover:bg-rose-100 hover:text-rose-800"
                disabled={!previewBook || deletingId === previewBook.id}
                onClick={() => setIsDeleteConfirmOpen(true)}
              >
                <X className="mr-1 h-3.5 w-3.5" />
                Eliminar
              </Button>
            </footer>
          </aside>
          <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
            <DialogContent className="rounded-xl border border-rose-200 bg-white/95 p-0 shadow-lg" showCloseButton={false}>
              <DialogHeader className="p-4 pb-2">
                <DialogTitle className="text-sm font-medium text-rose-900">¿Eliminar este libro?</DialogTitle>
                <DialogDescription className="text-xs text-slate-500">
                  {previewBook ? `Se eliminará "${previewBook.title}". Esta acción no se puede deshacer.` : "Esta acción no se puede deshacer."}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="mx-0 mb-0 flex flex-row items-center justify-end gap-2 rounded-b-xl border-rose-100 bg-rose-50/60 p-3">
                <Button
                  onClick={() => setIsDeleteConfirmOpen(false)}
                  disabled={deletingId === previewBook?.id}
                  variant="outline"
                  size="sm"
                  className="min-w-[96px] border-[#b08a63] bg-[#efe4d1] text-[#6f4b2e] shadow-sm hover:border-[#8e633d] hover:bg-[#e0c8a8] hover:text-[#5a3d24] hover:shadow"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={() => void confirmDeleteFromPreview()}
                  disabled={!previewBook || deletingId === previewBook.id}
                  variant="destructive"
                  size="sm"
                  className="min-w-[96px]"
                >
                  {deletingId === previewBook?.id ? "Eliminando..." : "Eliminar"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog
            open={isTagDialogOpen}
            onOpenChange={(open) => {
              setIsTagDialogOpen(open);
              if (!open) setActiveTagFilter(null);
            }}
          >
            <DialogContent className="max-w-[760px] border border-[#b68e66] bg-[#efe4d1] p-0 text-[#4d311d]">
              <DialogHeader className="border-b border-[#c4a27b]/70 px-5 pb-3 pt-4">
                <DialogTitle className="font-['Fraunces',serif] text-2xl text-[#5a2f1f]">
                  Libros con etiqueta {activeTagFilter ? `"${activeTagFilter}"` : ""}
                </DialogTitle>
                <DialogDescription className="text-sm text-[#7a573c]">
                  Selecciona un libro para abrir su ficha.
                </DialogDescription>
              </DialogHeader>
              <div className="max-h-[56vh] space-y-2 overflow-y-auto px-5 py-4">
                {booksWithActiveTag.length === 0 ? (
                  <p className="rounded-md border border-[#c4a27b]/70 bg-[#f5ecde] p-3 text-sm text-[#6f4b2e]">
                    No hay más libros con esta etiqueta.
                  </p>
                ) : (
                  booksWithActiveTag.map((book) => (
                    <button
                      key={book.id}
                      type="button"
                      onClick={() => {
                        setPreviewTab("info");
                        setPreviewBookId(book.id);
                        const params = new URLSearchParams(location.search);
                        params.set("preview", book.id);
                        navigate(
                          {
                            pathname: location.pathname,
                            search: `?${params.toString()}`
                          },
                          { replace: true }
                        );
                        setIsTagDialogOpen(false);
                        setActiveTagFilter(null);
                      }}
                      className="w-full rounded-md border border-[#c4a27b]/70 bg-[#f5ecde] p-3 text-left transition hover:bg-[#ead9bd]"
                    >
                      <p className="font-['Fraunces',serif] text-[1.15rem] text-[#5a2f1f]">{book.title}</p>
                      <p className="text-xs italic text-[#7a573c]">{book.author}</p>
                    </button>
                  ))
                )}
              </div>
              <DialogFooter className="!mx-0 !mb-0 border-t border-[#c4a27b]/70 bg-[#eadcc4] px-5 py-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsTagDialogOpen(false)}
                  className="border-[#b08a63] bg-[#efe4d1] text-[#6f4b2e] hover:border-[#8e633d] hover:bg-[#e2cfb2] hover:text-[#5a3d24]"
                >
                  Cerrar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog
            open={isMarkPageOpen}
            onOpenChange={(open) => {
              setIsMarkPageOpen(open);
              if (!open) setMarkPageError(null);
            }}
          >
            <DialogContent
              className="max-w-[322px] border-2 border-[#b6852f] bg-[#120402] p-0 text-[#e7c77f] shadow-[0_24px_70px_rgba(0,0,0,0.6)]"
              showCloseButton={false}
            >
              <DialogHeader className="border-b border-[#69481b] px-4 pb-2 pt-3">
                <DialogTitle className="font-['Fraunces',serif] text-[1.92rem] leading-none text-[#d5a63e]">
                  <span className="mr-2">🔖</span>
                  Marcar página
                </DialogTitle>
                <DialogDescription className="text-[15px] leading-snug text-[#bf9548]">
                  {previewBook?.title} · {previewBook?.pages ?? "?"} páginas
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 px-4 py-3.5">
                <div className="space-y-2">
                  <p className="text-[18px] font-semibold uppercase tracking-[0.04em] text-[#c79d4d]">Página actual:</p>
                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      min={0}
                      max={previewBook?.pages ?? 20000}
                      value={markPageInput}
                      onChange={(event) => setMarkPageInput(event.target.value)}
                      className="h-12 rounded-none border-[#8a6025] bg-[#1b0805] text-center text-[2rem] font-['Fraunces',serif] text-[#f2d89b]"
                    />
                    <span className="text-[1.95rem] font-['Fraunces',serif] leading-none text-[#d3ad62]">/ {previewBook?.pages ?? "?"}</span>
                  </div>
                </div>
                {typeof previewBook?.pages === "number" && previewBook.pages > 0 && (
                  <div>
                    <div className="h-1.5 w-full overflow-hidden border border-[#5d3a15] bg-[#2b1109]">
                      <div
                        className="h-full bg-[#b98a26]"
                        style={{
                          width: `${Math.max(
                            0,
                            Math.min(100, (Number(markPageInput || 0) / previewBook.pages) * 100)
                          )}%`
                        }}
                      />
                    </div>
                    <p className="mt-1 text-[1.02rem] text-[#d3ad62]">
                      Pág. {Number(markPageInput || 0)} ·{" "}
                      {Math.max(0, Math.min(100, Math.round((Number(markPageInput || 0) / previewBook.pages) * 100)))}%
                      completado
                    </p>
                  </div>
                )}
                {previewBook?.lastPageMarkedAt && (
                  <p className="text-[0.98rem] italic text-[#b9944d]">
                    Hoy, {new Date(previewBook.lastPageMarkedAt).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                )}
                <div>
                  <p className="mb-1 text-[18px] font-semibold uppercase tracking-[0.04em] text-[#c79d4d]">Historial reciente</p>
                  {recentMarkHistory.length === 0 ? (
                    <p className="text-base text-[#a5854a]">Todavía no hay páginas marcadas.</p>
                  ) : (
                    <div className="space-y-1 text-[1.02rem] text-[#d3ad62]">
                      {recentMarkHistory.map((entry) => (
                        <p key={entry.date.toISOString()} className="flex items-center justify-between border-b border-[#2a120a] py-1">
                          <span>{entry.label}</span>
                          <span>pág. {entry.page}</span>
                        </p>
                      ))}
                    </div>
                  )}
                </div>
                {markPageError && <p className="text-sm text-rose-300">{markPageError}</p>}
              </div>
              <DialogFooter className="!mx-0 !mb-0 flex flex-row items-center justify-between gap-2 border-t border-[#69481b] bg-[#100302] px-4 py-3.5">
                <Button
                  onClick={() => void saveMarkedPage()}
                  size="sm"
                  className="h-10 min-w-[112px] rounded-none border border-[#cf9f28] bg-[#cf9f28] text-[1.03rem] text-[#1f0d07] hover:bg-[#deb24e]"
                  disabled={isSavingMarkPage || !previewBook}
                >
                  {isSavingMarkPage ? "Guardando..." : "✓ Guardar"}
                </Button>
                <Button
                  onClick={() => setIsMarkPageOpen(false)}
                  variant="outline"
                  size="sm"
                  className="h-10 min-w-[112px] rounded-none border-[#724d1c] bg-transparent text-[1.03rem] text-[#d3ad62] hover:bg-[#2a120a] hover:text-[#e7c77f]"
                  disabled={isSavingMarkPage}
                >
                  Cancelar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog
            open={isReviewDialogOpen}
            onOpenChange={(open) => {
              setIsReviewDialogOpen(open);
              if (!open) {
                setReviewError(null);
              }
            }}
          >
            <DialogContent className="w-[99vw] max-w-[1200px] border-2 border-[#b6852f] bg-[#efe4d1] p-0 text-[#5a3b24] shadow-[0_24px_70px_rgba(0,0,0,0.5)]">
              <DialogHeader className="border-b border-[#b6852f] bg-[#6a320f] px-6 pb-3 pt-4 text-[#f3e7d5]">
                <DialogTitle className="font-['Fraunces',serif] text-3xl leading-none">
                  ✍️ Escribir reseña y valoración
                </DialogTitle>
                <DialogDescription className="pt-2 text-sm text-[#e8cfaa]">
                  {previewBook?.title} · {previewBook?.author}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-5 px-6 py-5">
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#8e633d]">
                    Valoración global
                  </p>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((value) => {
                      const active = ratingDraft >= value;
                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setRatingDraft((current) => (current === value ? 0 : value))}
                          className={`text-3xl leading-none transition ${active ? "text-[#b6852f]" : "text-[#cebfa8]"} hover:scale-110`}
                          aria-label={`Puntuar con ${value} estrellas`}
                          title={`Puntuar con ${value} estrellas`}
                        >
                          {active ? "★" : "☆"}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#8e633d]">Leído en</p>
                    <div className="relative" ref={readAtPickerRef}>
                      <button
                        type="button"
                        onClick={() => {
                          const parsed = parseIsoDate(readAtDraft);
                          setReadAtViewMonth(parsed ?? new Date());
                          setIsReadAtPickerOpen((open) => !open);
                        }}
                        className="flex h-10 w-full items-center justify-between rounded-lg border border-[#b68e66] bg-[#f5ecde] px-3 text-left text-sm text-[#5a3b24]"
                      >
                        <span>{readAtDraft ? formatReadAtLabel(readAtDraft) : "Seleccionar fecha..."}</span>
                        <CalendarDays className="h-4 w-4 text-[#8e633d]" />
                      </button>
                      {isReadAtPickerOpen && (
                        <div className="absolute left-0 top-[calc(100%+6px)] z-50 w-[300px] rounded-md border border-[#b68e66] bg-[#f5ecde] p-3 shadow-lg">
                          <div className="mb-2 flex items-center justify-between">
                            <button
                              type="button"
                              onClick={() =>
                                setReadAtViewMonth(
                                  (current) => new Date(current.getFullYear(), current.getMonth() - 1, 1)
                                )
                              }
                              className="rounded-sm border border-[#caa67a] bg-[#efe4d1] p-1 text-[#8e633d] hover:bg-[#e7d6bc]"
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </button>
                            <p className="text-sm font-semibold capitalize text-[#6a320f]">{monthNameLabel(readAtViewMonth)}</p>
                            <button
                              type="button"
                              onClick={() =>
                                setReadAtViewMonth(
                                  (current) => new Date(current.getFullYear(), current.getMonth() + 1, 1)
                                )
                              }
                              className="rounded-sm border border-[#caa67a] bg-[#efe4d1] p-1 text-[#8e633d] hover:bg-[#e7d6bc]"
                            >
                              <ChevronRight className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="mb-1 grid grid-cols-7 text-center text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8e633d]">
                            {["L", "M", "X", "J", "V", "S", "D"].map((d) => (
                              <span key={d}>{d}</span>
                            ))}
                          </div>
                          <div className="grid grid-cols-7 gap-1">
                            {buildCalendarCells(readAtViewMonth).map((date, idx) => {
                              const isSelected = date ? toIsoDate(date) === readAtDraft : false;
                              return (
                                <button
                                  key={`${idx}-${date ? toIsoDate(date) : "blank"}`}
                                  type="button"
                                  disabled={!date}
                                  onClick={() => {
                                    if (!date) return;
                                    setReadAtDraft(toIsoDate(date));
                                    setIsReadAtPickerOpen(false);
                                  }}
                                  className={`h-8 rounded-sm text-sm ${
                                    !date
                                      ? "cursor-default opacity-0"
                                      : isSelected
                                        ? "border border-[#b6852f] bg-[#b6852f] text-[#f5ecde]"
                                        : "border border-[#d0b188] bg-[#efe4d1] text-[#6a320f] hover:bg-[#e7d6bc]"
                                  }`}
                                >
                                  {date?.getDate() ?? ""}
                                </button>
                              );
                            })}
                          </div>
                          <div className="mt-2 flex items-center justify-between">
                            <button
                              type="button"
                              onClick={() => setReadAtDraft("")}
                              className="text-xs text-[#8e633d] underline"
                            >
                              Limpiar
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const today = new Date();
                                setReadAtDraft(toIsoDate(today));
                                setReadAtViewMonth(today);
                                setIsReadAtPickerOpen(false);
                              }}
                              className="text-xs text-[#8e633d] underline"
                            >
                              Hoy
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#8e633d]">Veces leído</p>
                    <Select
                      value={timesReadDraft}
                      onChange={(event) => setTimesReadDraft(event.target.value)}
                      className="!border-[#8e633d] !bg-[#8e633d] !text-[#f8f1e5] hover:!bg-[#7c5534] dark:!border-[#8e633d] dark:!bg-[#8e633d] dark:!text-[#f8f1e5]"
                    >
                      <option value="1ª vez">1ª vez</option>
                      <option value="2 veces">2 veces</option>
                      <option value="3 veces">3 veces</option>
                      <option value="4+ veces">4+ veces</option>
                    </Select>
                  </div>
                </div>
                <div>
                  <p className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.16em] text-[#8e633d]">
                    <span>Reseña personal</span>
                    <span>{reviewDraft.length}/2000</span>
                  </p>
                  <Textarea
                    value={reviewDraft}
                    onChange={(event) => setReviewDraft(capitalizeFirst(event.target.value))}
                    maxLength={2000}
                    className="min-h-[220px] resize-y border-[#b68e66] bg-[#f5ecde] text-[#5a3b24] placeholder:text-[#8e633d]/80"
                    placeholder="¿Qué te pareció el libro? Escribe con libertad..."
                  />
                </div>
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#8e633d]">
                    Frase o cita favorita
                  </p>
                  <Textarea
                    value={favoriteQuoteDraft}
                    onChange={(event) => setFavoriteQuoteDraft(capitalizeFirst(event.target.value))}
                    maxLength={600}
                    className="min-h-[90px] resize-y border-[#b68e66] bg-[#f5ecde] text-[#5a3b24] placeholder:text-[#8e633d]/80"
                    placeholder="Una frase del libro que te haya marcado..."
                  />
                </div>
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#8e633d]">Etiquetas temáticas</p>
                  <div className="mb-2">
                    <Input
                      value={reviewTagInput}
                      onChange={(event) => {
                        setReviewTagInput(capitalizeFirst(event.target.value));
                        if (reviewError) setReviewError(null);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          addReviewTag();
                        }
                      }}
                      maxLength={40}
                      className="h-10 border-[#b68e66] bg-[#f5ecde] text-[#5a3b24] placeholder:text-[#8e633d]/80"
                      placeholder="Escribe una etiqueta y pulsa Enter para añadirla..."
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {reviewTagsDraft.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => removeReviewTag(tag)}
                        className="inline-flex items-center gap-1 rounded-sm border border-[#d0b188] bg-[#f5ecde] px-2 py-1 text-xs font-semibold text-[#8e633d]"
                        title={`Quitar etiqueta ${tag}`}
                        aria-label={`Quitar etiqueta ${tag}`}
                      >
                        <span>{tag}</span>
                        <span className="text-[11px] leading-none">✕</span>
                      </button>
                    ))}
                    {reviewTagsDraft.length === 0 && <p className="text-xs text-[#8e633d]">Sin etiquetas todavía.</p>}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#8e633d]">¿Lo recomendarías?</p>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    <button
                      type="button"
                      onClick={() => setRecommendDraft("si")}
                      className={`rounded-sm border px-3 py-2 text-xs font-semibold text-center ${recommendDraft === "si" ? "border-[#b6852f] bg-[#f0dfbf] text-[#6a320f]" : "border-[#d0b188] bg-[#f5ecde] text-[#8e633d]"}`}
                    >
                      👍 Sí, lo recomiendo
                    </button>
                    <button
                      type="button"
                      onClick={() => setRecommendDraft("depende")}
                      className={`rounded-sm border px-3 py-2 text-xs font-semibold text-center ${recommendDraft === "depende" ? "border-[#b6852f] bg-[#f0dfbf] text-[#6a320f]" : "border-[#d0b188] bg-[#f5ecde] text-[#8e633d]"}`}
                    >
                      🤔 Depende del lector
                    </button>
                    <button
                      type="button"
                      onClick={() => setRecommendDraft("no")}
                      className={`rounded-sm border px-3 py-2 text-xs font-semibold text-center ${recommendDraft === "no" ? "border-[#b6852f] bg-[#f0dfbf] text-[#6a320f]" : "border-[#d0b188] bg-[#f5ecde] text-[#8e633d]"}`}
                    >
                      👎 No especialmente
                    </button>
                  </div>
                </div>
                {reviewError && <p className="text-sm text-rose-700">{reviewError}</p>}
              </div>
              <DialogFooter className="!mx-0 !mb-0 flex flex-row items-center justify-between gap-3 border-t border-[#c4a27b]/70 bg-[#eadcc4] px-6 py-4">
                <Button
                  onClick={() => setIsReviewDialogOpen(false)}
                  variant="outline"
                  size="sm"
                  className="h-10 min-w-[140px] border-[#b08a63] bg-[#efe4d1] text-[#6f4b2e] hover:border-[#8e633d] hover:bg-[#e2cfb2] hover:text-[#5a3d24]"
                  disabled={isSavingReview}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={() => void saveReview()}
                  size="sm"
                  className="h-10 min-w-[180px] border border-[#8e633d] bg-[#8e633d] text-[#f8f1e5] hover:bg-[#7c5534]"
                  disabled={isSavingReview || !previewBook}
                >
                  {isSavingReview ? "Guardando..." : "✦ Publicar reseña"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </section>
  );
};
