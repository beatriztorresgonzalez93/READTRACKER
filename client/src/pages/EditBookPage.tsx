// Página para editar un libro existente cargando sus datos por id.
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ApiError, getBookById, updateBook } from "../api/client";
import { BookForm } from "../components/BookForm";
import { Alert } from "../components/ui/alert";
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

  if (loading) return <p className="text-sm text-[#6f4b2e] dark:text-[#e0ccb4]">Cargando formulario...</p>;
  if (error && !book) return <Alert variant="destructive">{error}</Alert>;
  if (!book) return <Alert variant="destructive">Libro no encontrado</Alert>;

  return (
    <section className="space-y-6 text-[#4d311d] dark:text-[#f1dfcf]">
      <Link to="/" className="inline-block text-sm font-semibold text-[#8e633d] underline-offset-4 hover:underline dark:text-[#d7b06f]">
        ← Volver a la biblioteca
      </Link>
      <header className="border-b border-[#c4a27b]/70 pb-3">
        <h1 className="rt-page-title text-3xl text-[#5a2f1f] dark:text-[#f3e7d5]">Editar libro</h1>
      </header>
      {error && <Alert variant="destructive">{error}</Alert>}
      <BookForm
        initialValues={book}
        onSubmit={handleUpdateBook}
        submitLabel="Guardar cambios"
      />
    </section>
  );
};
