// Página para crear un nuevo libro usando el formulario reutilizable.
import { useCallback, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ApiError, createBook } from "../api/client";
import { BookForm } from "../components/BookForm";
import { Alert } from "../components/ui/alert";
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
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
          return;
        }
        setError("No se pudo crear el libro");
      }
    },
    [navigate, reloadBooks]
  );

  return (
    <section className="space-y-6 text-[#4d311d] dark:text-[#f1dfcf]">
      <Link to="/" className="inline-block text-sm font-semibold text-[#8e633d] underline-offset-4 hover:underline dark:text-[#d7b06f]">
        ← Volver a la biblioteca
      </Link>
      <header className="border-b border-[#c4a27b]/70 pb-3">
        <h1 className="rt-page-title text-3xl text-[#5a2f1f] dark:text-[#f3e7d5]">Añadir nuevo libro</h1>
      </header>
      {error && <Alert variant="destructive">{error}</Alert>}
      <BookForm onSubmit={handleCreateBook} />
    </section>
  );
};
