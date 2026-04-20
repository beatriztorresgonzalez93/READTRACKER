// Página para crear un nuevo libro usando el formulario reutilizable.
import { useCallback, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ApiError, createBook } from "../api/client";
import { BookForm } from "../components/BookForm";
import { Alert } from "../components/ui/alert";
import { Card, CardContent, CardHeader } from "../components/ui/card";
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
    <section className="space-y-5">
      <Link to="/" className="inline-block text-sm font-semibold text-cyan-700 underline-offset-4 hover:underline dark:text-cyan-300">
        ← Volver a la biblioteca
      </Link>
      <Card className="bg-white/90 dark:bg-slate-900/80">
        <CardHeader className="pb-1">
          <p className="rt-kicker text-slate-500 dark:text-slate-400">Formulario</p>
          <h1 className="rt-page-title mt-1 text-3xl text-slate-900 dark:text-slate-100">Añadir nuevo libro</h1>
        </CardHeader>
        <CardContent>
          <p className="rt-body-copy text-slate-600 dark:text-slate-300">
            Completa los datos principales y, si quieres, busca una portada automáticamente.
          </p>
        </CardContent>
      </Card>
      {error && <Alert variant="destructive">{error}</Alert>}
      <BookForm onSubmit={handleCreateBook} />
    </section>
  );
};
