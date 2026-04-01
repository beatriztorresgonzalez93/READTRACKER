// Página para editar un libro existente cargando sus datos por id.
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getBookById, updateBook } from "../api/booksApi";
import { BookForm } from "../components/BookForm";
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
      } catch {
        setError("No se pudo actualizar el libro");
      }
    },
    [id, navigate, reloadBooks]
  );

  if (loading) return <p className="text-sm text-slate-600 dark:text-slate-300">Cargando formulario...</p>;
  if (error && !book) return <p className="text-sm text-red-600">{error}</p>;
  if (!book) return <p className="text-sm text-red-600">Libro no encontrado</p>;

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Editar libro</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <BookForm
        initialValues={book}
        onSubmit={handleUpdateBook}
        submitLabel="Guardar cambios"
      />
    </section>
  );
};
