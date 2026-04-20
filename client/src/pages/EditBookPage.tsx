// Página para editar un libro existente cargando sus datos por id.
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ApiError, getBookById, updateBook } from "../api/client";
import { BookForm } from "../components/BookForm";
import { Alert } from "../components/ui/alert";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { useBooksContext } from "../context/BooksContext";
import { Book, CreateBookDto } from "../types/book";

export const EditBookPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { reloadBooks } = useBooksContext();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBook = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        const data = await getBookById(id);
        setBook(data);
      } catch {
        setError("No se pudo cargar el libro para editar");
      } finally {
        setLoading(false);
      }
    };

    void loadBook();
  }, [id]);

  const handleUpdateBook = useCallback(
    async (data: CreateBookDto) => {
      if (!id) return;
      try {
        setError(null);
        await updateBook(id, data);
        await reloadBooks();
        navigate(`/books/${id}`);
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
          return;
        }
        setError("No se pudo actualizar el libro");
      }
    },
    [id, navigate, reloadBooks]
  );

  if (loading) return <p className="text-sm text-slate-600 dark:text-slate-300">Cargando formulario...</p>;
  if (error && !book) return <Alert variant="destructive">{error}</Alert>;
  if (!book) return <Alert variant="destructive">Libro no encontrado</Alert>;

  return (
    <section className="space-y-5">
      <Link to="/" className="inline-block text-sm font-semibold text-cyan-700 underline-offset-4 hover:underline dark:text-cyan-300">
        ← Volver a la biblioteca
      </Link>
      <Card className="bg-white/90 dark:bg-slate-900/80">
        <CardHeader className="pb-1">
          <p className="rt-kicker text-slate-500 dark:text-slate-400">Formulario</p>
          <h1 className="rt-page-title mt-1 text-3xl text-slate-900 dark:text-slate-100">Editar libro</h1>
        </CardHeader>
        <CardContent>
          <p className="rt-body-copy text-slate-600 dark:text-slate-300">
            Actualiza los datos del libro y guarda los cambios.
          </p>
        </CardContent>
      </Card>
      {error && <Alert variant="destructive">{error}</Alert>}
      <BookForm
        initialValues={book}
        onSubmit={handleUpdateBook}
        submitLabel="Guardar cambios"
      />
    </section>
  );
};
