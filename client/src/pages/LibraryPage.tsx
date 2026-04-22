// Página principal con listado, búsqueda y filtros de la biblioteca.
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { BookOpen, Bookmark, Clock3, Heart, PencilLine, X } from "lucide-react";
import { deleteBook, getBookById, updateBook } from "../api/client";
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
import { useBooksContext } from "../context/BooksContext";
import { useBookFilters } from "../hooks/useBookFilters";
import { Book } from "../types/book";

export const LibraryPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { books, loading, error, reloadBooks, upsertBook } = useBooksContext();
  const { search, setSearch, status, setStatus, sortBy, setSortBy, filteredBooks } = useBookFilters(books);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [activeGenre, setActiveGenre] = useState<string | null>(null);
  const [activeShelf, setActiveShelf] = useState<"todos" | "pendiente" | "leido" | "leyendo" | "favoritos" | null>(null);
  const [previewBookId, setPreviewBookId] = useState<string | null>(null);
  const [previewBook, setPreviewBook] = useState<Book | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewTab, setPreviewTab] = useState<"info" | "resena" | "similares">("info");
  const [isClosingPreview, setIsClosingPreview] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isMarkPageOpen, setIsMarkPageOpen] = useState(false);
  const [markPageInput, setMarkPageInput] = useState("");
  const [markPageError, setMarkPageError] = useState<string | null>(null);
  const [isSavingMarkPage, setIsSavingMarkPage] = useState(false);
  const [isSavingRating, setIsSavingRating] = useState(false);
  const [isShowingAllCollection, setIsShowingAllCollection] = useState(false);
  const previewCloseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nowReading = useMemo(() => books.find((book) => book.status === "leyendo"), [books]);
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
    if (!activeShelf || activeShelf === "todos") return filteredBooks;
    if (activeShelf === "favoritos") return filteredBooks.filter((book) => book.isFavorite);
    return filteredBooks.filter((book) => book.status === activeShelf);
  }, [activeShelf, filteredBooks]);
  const visibleBooks = useMemo(() => {
    if (!activeGenre) return shelfFilteredBooks;
    return shelfFilteredBooks.filter((book) => book.genre.localeCompare(activeGenre, "es", { sensitivity: "base" }) === 0);
  }, [activeGenre, shelfFilteredBooks]);
  const similarBooks = useMemo(() => {
    if (!previewBook) return [];
    return books
      .filter(
        (book) =>
          book.id !== previewBook.id &&
          book.genre.localeCompare(previewBook.genre, "es", { sensitivity: "base" }) === 0
      )
      .slice(0, 6);
  }, [books, previewBook]);
  const previewVisibleBooks = useMemo(() => visibleBooks.slice(0, 12), [visibleBooks]);
  const collectionBooks = isShowingAllCollection ? visibleBooks : previewVisibleBooks;

  const handleDeleteBook = async (id: string) => {
    try {
      setDeleteError(null);
      setDeletingId(id);
      await deleteBook(id);
      await reloadBooks();
    } catch {
      setDeleteError("No se pudo eliminar el libro. Inténtalo de nuevo.");
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

  const closePreview = () => {
    if (!previewBookId || isClosingPreview) return;
    setIsClosingPreview(true);
    previewCloseTimeoutRef.current = setTimeout(() => {
      setPreviewBookId(null);
      setIsClosingPreview(false);
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

  const setPreviewRating = async (rating: number) => {
    if (!previewBook || isSavingRating) return;
    const normalized = Math.max(0, Math.min(5, rating));
    const currentRating = previewBook.rating ?? 0;
    const nextRating = currentRating === normalized ? 0 : normalized;
    try {
      setIsSavingRating(true);
      const updated = await updateBook(previewBook.id, { rating: nextRating });
      setPreviewBook(updated);
      upsertBook(updated);
    } finally {
      setIsSavingRating(false);
    }
  };

  const openMarkPageDialog = () => {
    if (!previewBook) return;
    setMarkPageError(null);
    setMarkPageInput(String(previewBook.currentPage ?? 0));
    setIsMarkPageOpen(true);
  };

  const recentMarkHistory = useMemo(() => {
    if (!previewBook) return [];
    const events: Array<{ date: Date; label: string; page: number }> = [];
    if (typeof previewBook.currentPage === "number") {
      const baseDate = previewBook.lastPageMarkedAt ? new Date(previewBook.lastPageMarkedAt) : new Date(previewBook.updatedAt);
      if (!Number.isNaN(baseDate.getTime())) {
        events.push({
          date: baseDate,
          label: baseDate.toLocaleDateString("es-ES", { day: "numeric", month: "short" }),
          page: previewBook.currentPage
        });
      }
    }
    return events.slice(0, 3);
  }, [previewBook]);

  const saveMarkedPage = async () => {
    if (!previewBook) return;
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
      const updated = await updateBook(previewBook.id, {
        currentPage: parsed,
        lastPageMarkedAt: nowIso,
        progress: computedProgress,
        status: nextStatus
      });
      setPreviewBook(updated);
      upsertBook(updated);
      setIsMarkPageOpen(false);
    } catch {
      setMarkPageError("No se pudo guardar la marca de página. Inténtalo de nuevo.");
    } finally {
      setIsSavingMarkPage(false);
    }
  };

  return (
    <section className="relative min-h-full space-y-6 bg-transparent pl-1 pr-4 py-2 text-amber-50 sm:pl-2 sm:pr-6">
      <div className={`grid gap-5 lg:grid-cols-[260px_1fr] ${previewBookId ? "pointer-events-none select-none" : ""}`}>
        <aside className="space-y-4">
          <div className="rounded-md border border-amber-700/60 bg-[#e9dcc4] p-4 text-[#4d311d]">
            <p className="mb-3 text-xs font-semibold tracking-[0.18em] text-[#7a573c]">MI BIBLIOTECA</p>
            <div className="mb-3 border-t border-[#c4a27b]/70" />
            <div className="grid grid-cols-2 gap-3 text-center">
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

          <div className="rounded-md border border-amber-700/60 bg-[#e9dcc4] p-4 text-[#4d311d]">
            <p className="mb-2 text-xs font-semibold tracking-[0.18em] text-[#7a573c]">LEYENDO AHORA</p>
            <div className="mb-3 border-t border-[#c4a27b]/70" />
            {nowReading ? (
              <div className="space-y-1">
                <p className="text-xs italic text-[#7a573c]">Lectura actual</p>
                <p className="font-['Fraunces',serif] text-lg leading-tight">{nowReading.title}</p>
                <p className="text-sm">{nowReading.author}</p>
                <p className="text-xs">Avance: {nowReading.progress ?? 0}%</p>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[#d9c7ad]">
                  <div
                    className="h-full rounded-full bg-[#8e633d]"
                    style={{ width: `${Math.max(0, Math.min(100, nowReading.progress ?? 0))}%` }}
                  />
                </div>
              </div>
            ) : (
              <p className="text-sm">No hay lectura activa ahora mismo.</p>
            )}
          </div>

          <div className="rounded-md border border-amber-700/60 bg-[#e9dcc4] p-4 text-[#4d311d]">
            <p className="mb-2 text-xs font-semibold tracking-[0.18em] text-[#7a573c]">ESTANTES</p>
            <div className="mb-3 border-t border-[#c4a27b]/70" />
            <ul className="space-y-2 text-sm">
              <li className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setActiveShelf((current) => (current === "todos" ? null : "todos"))}
                  className={`inline-flex items-center gap-2 transition hover:underline ${activeShelf === "todos" ? "font-semibold underline" : ""}`}
                >
                  <BookOpen className="h-3.5 w-3.5" />Todos
                </button>
                <span>{books.length}</span>
              </li>
              <li className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setActiveShelf((current) => (current === "pendiente" ? null : "pendiente"))}
                  className={`inline-flex items-center gap-2 transition hover:underline ${activeShelf === "pendiente" ? "font-semibold underline" : ""}`}
                >
                  <BookOpen className="h-3.5 w-3.5" />Pendientes
                </button>
                <span>{books.filter((b) => b.status === "pendiente").length}</span>
              </li>
              <li className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setActiveShelf((current) => (current === "leido" ? null : "leido"))}
                  className={`inline-flex items-center gap-2 transition hover:underline ${activeShelf === "leido" ? "font-semibold underline" : ""}`}
                >
                  <Bookmark className="h-3.5 w-3.5" />Leídos
                </button>
                <span>{readCount}</span>
              </li>
              <li className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setActiveShelf((current) => (current === "leyendo" ? null : "leyendo"))}
                  className={`inline-flex items-center gap-2 transition hover:underline ${activeShelf === "leyendo" ? "font-semibold underline" : ""}`}
                >
                  <Clock3 className="h-3.5 w-3.5" />En progreso
                </button>
                <span>{books.filter((b) => b.status === "leyendo").length}</span>
              </li>
              <li className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setActiveShelf((current) => (current === "favoritos" ? null : "favoritos"))}
                  className={`inline-flex items-center gap-2 transition hover:underline ${activeShelf === "favoritos" ? "font-semibold underline" : ""}`}
                >
                  <Heart className="h-3.5 w-3.5" />Favoritos
                </button>
                <span>{books.filter((b) => b.isFavorite).length}</span>
              </li>
            </ul>
          </div>
          <div className="rounded-md border border-amber-700/60 bg-[#e9dcc4] p-4 text-[#4d311d]">
            <p className="mb-2 text-xs font-semibold tracking-[0.18em] text-[#7a573c]">GÉNEROS</p>
            <div className="mb-3 border-t border-[#c4a27b]/70" />
            {genres.length === 0 ? (
              <p className="text-sm">Sin géneros todavía.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                <li className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setActiveGenre(null)}
                    className={`line-clamp-1 transition hover:underline ${activeGenre === null ? "font-semibold text-[#5a2f1f] underline" : ""}`}
                  >
                    Todos
                  </button>
                  <span>{books.length}</span>
                </li>
                {genres.map(([genre, count]) => (
                  <li key={genre} className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setActiveGenre((current) => (current === genre ? null : genre))}
                      className={`line-clamp-1 transition hover:underline ${
                        activeGenre === genre ? "font-semibold text-[#5a2f1f] underline" : ""
                      }`}
                    >
                      {genre}
                    </button>
                    <span>{count}</span>
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

          <div className="border-t border-amber-700/60 pt-4">
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
          <div className="border-t border-amber-700/60 pt-4">
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
        </div>
      </div>
      {previewBookId && (
        <>
          <div
            className={`${isClosingPreview ? "animate-fade-out-soft" : "animate-fade-in-soft"} fixed left-0 top-0 z-40 h-[100dvh] w-[100vw] bg-black/45 backdrop-blur-[2px]`}
            onClick={closePreview}
            aria-hidden
          />
          <aside className={`${isClosingPreview ? "animate-slide-out-right-soft" : "animate-slide-in-right-soft"} fixed inset-y-0 right-0 z-50 flex w-full max-w-[600px] flex-col border-l-2 border-[#b78945] bg-[#f2e6d3] text-[#4d311d] shadow-2xl`}>
            <header
              className="relative border-b border-[#8f643f] bg-gradient-to-b from-[#63131d] via-[#4b0f16] to-[#2f0b0f] px-4 pb-2 pt-3 text-amber-50"
              style={{
                backgroundImage:
                  "radial-gradient(circle at center, rgba(200,82,82,0.25) 0 2px, transparent 2px), radial-gradient(circle at center, rgba(200,82,82,0.18) 0 1px, transparent 1px), linear-gradient(to bottom, rgba(99,19,29,0.95), rgba(47,11,15,0.98))",
                backgroundSize: "80px 80px, 80px 80px, 100% 100%",
                backgroundPosition: "0 0, 40px 40px, 0 0"
              }}
            >
              <div className="mb-2 flex items-start justify-between gap-3">
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
                    <p className="mt-1.5 text-base text-[#cf9f28]">
                      {"★".repeat(previewBook?.rating ?? 0)}
                      {"☆".repeat(Math.max(0, 5 - (previewBook?.rating ?? 0)))}
                    </p>
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
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="inline-flex rounded-sm border border-[#b68e66] bg-[#e9dcc4] px-2 py-1 text-xs font-semibold uppercase tracking-wide">
                        {previewBook.status}
                      </p>
                      {previewBook.isFavorite && (
                        <p className="inline-flex items-center rounded-sm border border-amber-500/60 bg-amber-100 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-amber-800">
                          <Heart className="mr-1 h-3.5 w-3.5 fill-rose-500 text-rose-500" />
                          Favorito
                        </p>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.12em] text-[#7a573c]">Año</p>
                        <p>{previewBook.publicationYear ?? "—"}</p>
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.12em] text-[#7a573c]">Páginas</p>
                        <p>{previewBook.pages ?? "—"}</p>
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.12em] text-[#7a573c]">Género</p>
                        <p>{previewBook.genre}</p>
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.12em] text-[#7a573c]">Editorial</p>
                        <p>{previewBook.publisher || "—"}</p>
                      </div>
                    </div>
                    <div className="border-t border-[#c4a27b]/70 pt-3">
                      <p className="text-[11px] uppercase tracking-[0.12em] text-[#7a573c]">Valoración</p>
                      <div className="flex items-center gap-0.5 text-[#8e633d]">
                        {[1, 2, 3, 4, 5].map((value) => {
                          const active = (previewBook.rating ?? 0) >= value;
                          return (
                            <button
                              key={value}
                              type="button"
                              onClick={() => void setPreviewRating(value)}
                              disabled={isSavingRating}
                              className={`text-lg leading-none transition ${active ? "text-[#8e633d]" : "text-[#b89a79]"} ${isSavingRating ? "cursor-wait opacity-60" : "hover:scale-110"}`}
                              aria-label={`Valorar con ${value} estrellas`}
                              title={`Valorar con ${value} estrellas`}
                            >
                              {active ? "★" : "☆"}
                            </button>
                          );
                        })}
                        {isSavingRating && <span className="ml-2 text-xs text-[#7a573c]">Guardando...</span>}
                      </div>
                    </div>
                  </div>
                ) : previewTab === "resena" ? (
                  <div className="space-y-3">
                    <p className="text-[11px] uppercase tracking-[0.12em] text-[#7a573c]">Mi reseña</p>
                    <p className="rounded-md border border-[#c4a27b]/70 bg-[#efe4d1] p-3 text-sm leading-relaxed">
                      {previewBook.review?.trim() || "Todavía no has escrito una reseña para este libro."}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-[11px] uppercase tracking-[0.12em] text-[#7a573c]">Similares</p>
                    <p className="text-sm italic text-[#8e633d]">
                      Libros que podrían interesarte basados en este título
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
                            className="rounded-sm border border-[#d3b98f] bg-[#efe4d1] p-2 text-left transition hover:bg-[#e7d6bc]"
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
                            <span className="block line-clamp-1 text-xs italic text-[#8e633d]">Sugerido</span>
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
              <Link to={previewBook ? `/books/${previewBook.id}/edit` : "#"}>
                <Button
                  size="sm"
                  className="h-10 w-full rounded-none border border-[#8e633d] bg-[#8e633d] px-3 text-[#f8f1e5] hover:bg-[#7c5534]"
                >
                  <PencilLine className="mr-2 h-3.5 w-3.5" />
                  Editar información
                </Button>
              </Link>
              <Button
                size="sm"
                variant="outline"
                className="h-10 w-full rounded-none border-[#b08a63] bg-[#efe4d1] text-[#8e633d] hover:border-[#8e633d] hover:bg-[#dcbf98] hover:text-[#6f4b2e]"
                onClick={openMarkPageDialog}
                disabled={!previewBook}
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
        </>
      )}
    </section>
  );
};
