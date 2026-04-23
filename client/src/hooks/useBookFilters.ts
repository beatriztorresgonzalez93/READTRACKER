// Hook reutilizable que centraliza búsqueda y filtro por estado en la biblioteca.
import { useEffect, useMemo, useState } from "react";
import { Book, ReadingStatus } from "../types/book";

export type BookSort = "recientes" | "titulo" | "autor" | "genero" | "valoracion";
const BOOK_FILTERS_STORAGE_KEY = "readtracker-library-filters";

type StoredBookFilters = {
  search?: string;
  status?: ReadingStatus | "todos";
  sortBy?: BookSort;
};

const isStatusValue = (value: unknown): value is ReadingStatus | "todos" =>
  value === "todos" || value === "pendiente" || value === "leyendo" || value === "leido";

const isSortValue = (value: unknown): value is BookSort =>
  value === "recientes" || value === "titulo" || value === "autor" || value === "genero" || value === "valoracion";

const readStoredFilters = (): StoredBookFilters => {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(BOOK_FILTERS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as StoredBookFilters;
    return {
      search: typeof parsed.search === "string" ? parsed.search : "",
      status: isStatusValue(parsed.status) ? parsed.status : "todos",
      sortBy: isSortValue(parsed.sortBy) ? parsed.sortBy : "recientes"
    };
  } catch {
    return {};
  }
};

export const useBookFilters = (books: Book[]) => {
  const stored = readStoredFilters();
  const [search, setSearch] = useState(stored.search ?? "");
  const [status, setStatus] = useState<ReadingStatus | "todos">(stored.status ?? "todos");
  const [sortBy, setSortBy] = useState<BookSort>(stored.sortBy ?? "recientes");

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(
        BOOK_FILTERS_STORAGE_KEY,
        JSON.stringify({
          search,
          status,
          sortBy
        })
      );
    } catch {
      // Si localStorage falla (modo privado, cuota, etc.), no rompemos la página.
    }
  }, [search, status, sortBy]);

  const filteredBooks = useMemo(() => {
    const normalized = search.toLowerCase();
    const result = books.filter((book) => {
      const matchesSearch =
        book.title.toLowerCase().includes(normalized) ||
        book.author.toLowerCase().includes(normalized) ||
        book.publisher.toLowerCase().includes(normalized) ||
        book.genre.toLowerCase().includes(normalized);
      const matchesStatus = status === "todos" || book.status === status;
      return matchesSearch && matchesStatus;
    });

    return result.toSorted((a, b) => {
      if (sortBy === "titulo") return a.title.localeCompare(b.title, "es", { sensitivity: "base" });
      if (sortBy === "autor") return a.author.localeCompare(b.author, "es", { sensitivity: "base" });
      if (sortBy === "genero") return a.genre.localeCompare(b.genre, "es", { sensitivity: "base" });
      if (sortBy === "valoracion") return (b.rating ?? -1) - (a.rating ?? -1);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [books, search, status, sortBy]);

  return { search, setSearch, status, setStatus, sortBy, setSortBy, filteredBooks };
};
