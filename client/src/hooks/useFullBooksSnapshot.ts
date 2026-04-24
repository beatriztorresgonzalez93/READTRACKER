// Carga toda la biblioteca por páginas (para estadísticas, reseñas, etc.).
import { useEffect, useState } from "react";
import { fetchAllBooksSnapshot } from "../api/client";
import { Book } from "../types/book";

export const useFullBooksSnapshot = (enabled = true) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setBooks([]);
      setLoading(false);
      setError(null);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const rows = await fetchAllBooksSnapshot();
        if (!cancelled) setBooks(rows);
      } catch {
        if (!cancelled) setError("No se pudo cargar la biblioteca");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return { books, loading, error };
};
