// Página para crear un nuevo libro usando el formulario reutilizable.
import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createBook } from "../api/booksApi";
import { BookForm } from "../components/BookForm";
import { useBooksContext } from "../context/BooksContext";
import { CreateBookDto } from "../types/book";

export const NewBookPage = () => {
  const navigate = useNavigate();
  const { reloadBooks } = useBooksContext();
  const [error, setError] = useState<string | null>(null);

  const handleCreateBook = useCallback(
    async (data: CreateBookDto) => {
      try {
        setError(null);
        const created = await createBook(data);
        await reloadBooks();
        navigate(`/books/${created.id}`);
      } catch {
        setError("No se pudo crear el libro");
      }
    },
    [navigate, reloadBooks]
  );

  return (
    <section className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Formulario</p>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Nuevo libro</h1>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <BookForm onSubmit={handleCreateBook} />
    </section>
  );
};
