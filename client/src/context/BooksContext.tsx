// Contexto global de libros: colección paginada en la API y resumen para la barra lateral.
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  BOOKS_PAGE_SIZE,
  getBooksPage,
  getBooksSummary,
  type BooksSortParam,
  type LibrarySummary
} from "../api/client";
import { Book, ReadingStatus } from "../types/book";
import { useAuth } from "./AuthContext";

export type LibraryShelfFilter = "todos" | "pendiente" | "leyendo" | "leido" | "favoritos";

export interface LibraryBooksQuery {
  search: string;
  status: ReadingStatus | "todos";
  sort: BooksSortParam;
  shelf: LibraryShelfFilter;
  genre: string | null;
}

interface BooksContextValue {
  books: Book[];
  booksTotal: number;
  librarySummary: LibrarySummary | null;
  nowReadingPreview: Book[];
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  syncLibraryQuery: (query: LibraryBooksQuery) => Promise<void>;
  loadMoreBooks: () => Promise<void>;
  reloadBooks: () => Promise<void>;
  upsertBook: (book: Book) => void;
}

const BooksContext = createContext<BooksContextValue | undefined>(undefined);

const neutralLeyendoQuery = (): Parameters<typeof getBooksPage>[0] => ({
  search: "",
  status: "leyendo",
  shelf: "todos",
  genre: null,
  sort: "recientes",
  limit: 8,
  offset: 0
});

export const BooksProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [booksTotal, setBooksTotal] = useState(0);
  const [librarySummary, setLibrarySummary] = useState<LibrarySummary | null>(null);
  const [nowReadingPreview, setNowReadingPreview] = useState<Book[]>([]);
  const [activeQuery, setActiveQuery] = useState<LibraryBooksQuery | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSummaryAndReading = useCallback(async () => {
    try {
      const [summary, leyendoRes] = await Promise.all([getBooksSummary(), getBooksPage(neutralLeyendoQuery())]);
      setLibrarySummary(summary);
      setNowReadingPreview(leyendoRes.data);
    } catch {
      setLibrarySummary(null);
      setNowReadingPreview([]);
    }
  }, []);

  const syncLibraryQuery = useCallback(async (query: LibraryBooksQuery) => {
    if (!isAuthenticated) {
      setBooks([]);
      setBooksTotal(0);
      setActiveQuery(null);
      setLoading(false);
      setError(null);
      return;
    }
    setActiveQuery(query);
    setLoading(true);
    setError(null);
    try {
      const { data, meta } = await getBooksPage({
        search: query.search,
        status: query.status,
        shelf: query.shelf,
        genre: query.genre,
        sort: query.sort,
        limit: BOOKS_PAGE_SIZE,
        offset: 0
      });
      setBooks(data);
      setBooksTotal(meta.total);
      await fetchSummaryAndReading();
    } catch {
      setError("No se pudo cargar la biblioteca");
      setBooks([]);
      setBooksTotal(0);
    } finally {
      setLoading(false);
    }
  }, [fetchSummaryAndReading, isAuthenticated]);

  const loadMoreBooks = useCallback(async () => {
    if (!isAuthenticated || !activeQuery || loadingMore || books.length >= booksTotal) return;
    setLoadingMore(true);
    setError(null);
    try {
      const { data } = await getBooksPage({
        search: activeQuery.search,
        status: activeQuery.status,
        shelf: activeQuery.shelf,
        genre: activeQuery.genre,
        sort: activeQuery.sort,
        limit: BOOKS_PAGE_SIZE,
        offset: books.length
      });
      setBooks((prev) => [...prev, ...data]);
    } catch {
      setError("No se pudieron cargar más libros");
    } finally {
      setLoadingMore(false);
    }
  }, [activeQuery, books.length, booksTotal, isAuthenticated, loadingMore]);

  const reloadBooks = useCallback(async () => {
    if (!isAuthenticated || !activeQuery) {
      setBooks([]);
      setBooksTotal(0);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data, meta } = await getBooksPage({
        search: activeQuery.search,
        status: activeQuery.status,
        shelf: activeQuery.shelf,
        genre: activeQuery.genre,
        sort: activeQuery.sort,
        limit: BOOKS_PAGE_SIZE,
        offset: 0
      });
      setBooks(data);
      setBooksTotal(meta.total);
      await fetchSummaryAndReading();
    } catch {
      setError("No se pudo cargar la biblioteca");
    } finally {
      setLoading(false);
    }
  }, [activeQuery, fetchSummaryAndReading, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      setBooks([]);
      setBooksTotal(0);
      setLibrarySummary(null);
      setNowReadingPreview([]);
      setActiveQuery(null);
      setLoading(false);
      setError(null);
    }
  }, [isAuthenticated]);

  const upsertBook = useCallback((book: Book) => {
    setBooks((prev) => {
      const ix = prev.findIndex((b) => b.id === book.id);
      if (ix >= 0) {
        const next = [...prev];
        next[ix] = book;
        return next;
      }
      return [book, ...prev];
    });
  }, []);

  const value = useMemo<BooksContextValue>(
    () => ({
      books,
      booksTotal,
      librarySummary,
      nowReadingPreview,
      loading,
      loadingMore,
      error,
      syncLibraryQuery,
      loadMoreBooks,
      reloadBooks,
      upsertBook
    }),
    [
      books,
      booksTotal,
      error,
      librarySummary,
      loadMoreBooks,
      loading,
      loadingMore,
      nowReadingPreview,
      reloadBooks,
      syncLibraryQuery,
      upsertBook
    ]
  );

  return <BooksContext.Provider value={value}>{children}</BooksContext.Provider>;
};

export const useBooksContext = () => {
  const context = useContext(BooksContext);
  if (!context) {
    throw new Error("useBooksContext must be used inside BooksProvider");
  }
  return context;
};
