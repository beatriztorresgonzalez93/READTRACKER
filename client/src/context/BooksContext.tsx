// Contexto global de libros para compartir estado, carga y recarga en toda la app.
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { getBooks } from "../api/client";
import { Book } from "../types/book";

interface BooksContextValue {
  books: Book[];
  loading: boolean;
  error: string | null;
  reloadBooks: () => Promise<void>;
}

const BooksContext = createContext<BooksContextValue | undefined>(undefined);

export const BooksProvider = ({ children }: { children: ReactNode }) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reloadBooks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getBooks();
      setBooks(data);
    } catch {
      setError("No se pudo cargar la biblioteca");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reloadBooks();
  }, [reloadBooks]);

  return (
    <BooksContext.Provider value={{ books, loading, error, reloadBooks }}>
      {children}
    </BooksContext.Provider>
  );
};

export const useBooksContext = () => {
  const context = useContext(BooksContext);
  if (!context) {
    throw new Error("useBooksContext must be used inside BooksProvider");
  }
  return context;
};
