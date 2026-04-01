// Hook reutilizable que centraliza búsqueda y filtro por estado en la biblioteca.
import { useMemo, useState } from "react";
import { Book, ReadingStatus } from "../types/book";

export const useBookFilters = (books: Book[]) => {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ReadingStatus | "todos">("todos");

  const filteredBooks = useMemo(() => {
    const normalized = search.toLowerCase();
    return books.filter((book) => {
      const matchesSearch =
        book.title.toLowerCase().includes(normalized) ||
        book.author.toLowerCase().includes(normalized) ||
        book.genre.toLowerCase().includes(normalized);
      const matchesStatus = status === "todos" || book.status === status;
      return matchesSearch && matchesStatus;
    });
  }, [books, search, status]);

  return { search, setSearch, status, setStatus, filteredBooks };
};
