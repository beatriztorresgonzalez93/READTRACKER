// Página de detalle de un libro con acciones de volver y editar.
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getBookById } from "../api/booksApi";
import { Book } from "../types/book";

export const BookDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [coverBroken, setCoverBroken] = useState(false);

  useEffect(() => {
    setCoverBroken(false);
  }, [book?.coverUrl, book?.id]);

  useEffect(() => {
    const loadBook = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        const data = await getBookById(id);
        setBook(data);
      } catch {
        setError("No se encontró el libro");
      } finally {
        setLoading(false);
      }
    };

    void loadBook();
  }, [id]);

  if (loading) return <p className="text-sm text-slate-600 dark:text-slate-300">Cargando detalle...</p>;
  if (error || !book) return <p className="text-sm text-red-600">{error ?? "Error"}</p>;

  return (
    <section className="space-y-6 rounded-2xl border border-indigo-100 bg-gradient-to-br from-white to-indigo-50/40 p-6 shadow-sm dark:border-indigo-900/40 dark:from-slate-900 dark:to-indigo-950/20">
      <div className="flex flex-col gap-6 md:flex-row">
        {book.coverUrl && !coverBroken ? (
          <img
            src={book.coverUrl}
            alt={`Portada de ${book.title}`}
            className="h-64 w-48 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-700"
            onError={() => setCoverBroken(true)}
          />
        ) : book.coverUrl && coverBroken ? (
          <div className="flex h-64 w-48 shrink-0 items-center justify-center rounded-xl bg-gradient-to-b from-indigo-100 to-indigo-200 text-center text-sm font-semibold text-indigo-700 ring-1 ring-indigo-200 dark:from-indigo-900/40 dark:to-indigo-800/40 dark:text-indigo-300 dark:ring-indigo-900/40">
            Sin portada
          </div>
        ) : null}
        <div className="flex-1 space-y-3">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{book.title}</h1>
          <p className="text-slate-700 dark:text-slate-300"><span className="font-medium">Autor:</span> {book.author}</p>
          <p className="text-slate-700 dark:text-slate-300"><span className="font-medium">Género:</span> {book.genre}</p>
          <p className="text-slate-700 dark:text-slate-300"><span className="font-medium">Estado:</span> {book.status}</p>
          <p className="text-slate-700 dark:text-slate-300"><span className="font-medium">Calificación:</span> {book.rating ?? "-"}</p>
          <p className="text-slate-700 dark:text-slate-300"><span className="font-medium">Progreso:</span> {book.progress ?? 0}%</p>
          <p className="text-slate-700 dark:text-slate-300"><span className="font-medium">Reseña:</span> {book.review ?? "Sin reseña"}</p>
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-slate-200 pt-4 dark:border-slate-800">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Acciones</h2>
        <div className="flex items-center gap-4">
          <Link to={`/books/${book.id}/edit`} className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500">
            Editar
          </Link>
          <Link to="/" className="text-sm font-medium text-indigo-700 hover:text-indigo-800">
            Volver
          </Link>
        </div>
      </div>
    </section>
  );
};
