// Página para crear un nuevo libro usando el formulario reutilizable.
import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createBook } from "../api/client";
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
      } catch {
        setError("No se pudo crear el libro");
      }
    },
    [navigate, reloadBooks]
  );

  return (
    <section className="space-y-5">
      <Card className="bg-[#f8fbf6]/90 dark:bg-[#233229]/85">
        <CardHeader className="pb-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Formulario</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">Añadir nuevo libro</h1>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Completa los datos principales y, si quieres, busca una portada automáticamente.
          </p>
        </CardContent>
      </Card>
      {error && <Alert variant="destructive">{error}</Alert>}
      <BookForm onSubmit={handleCreateBook} />
    </section>
  );
};
