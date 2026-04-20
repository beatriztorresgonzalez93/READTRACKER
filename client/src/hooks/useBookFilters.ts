// Hook reutilizable que centraliza búsqueda y filtro por estado en la biblioteca.
import { useMemo, useState } from "react";
import { Book, ReadingStatus } from "../types/book";

export type BookSort = "recientes" | "titulo" | "autor" | "genero" | "valoracion";

export const useBookFilters = (books: Book[]) => {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ReadingStatus | "todos">("todos");
  const [sortBy, setSortBy] = useState<BookSort>("recientes");

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
