// Página de detalle de un libro con acciones de volver y editar.
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getBookById } from "../api/client";
import { Alert } from "../components/ui/alert";
import { Button } from "../components/ui/button";
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
  if (error || !book) return <Alert variant="destructive">{error ?? "Error"}</Alert>;

  return (
    <section className="space-y-6 rounded-2xl border border-[#d5dfd2] bg-[radial-gradient(circle_at_top_right,_#f5faf2_0%,_#ffffff_65%)] p-6 shadow-sm dark:border-[#3d5346] dark:bg-[radial-gradient(circle_at_top_right,_#2d3f35_0%,_#1f2b25_75%)]">
      <div className="flex flex-col gap-6 md:flex-row">
        {book.coverUrl && !coverBroken ? (
          <img
            src={book.coverUrl}
            alt={`Portada de ${book.title}`}
            className="h-80 w-56 rounded-2xl object-cover shadow-lg ring-1 ring-slate-200 dark:ring-slate-700"
            onError={() => setCoverBroken(true)}
          />
        ) : book.coverUrl && coverBroken ? (
          <div className="flex h-80 w-56 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-b from-[#d5e2d3] to-[#b8ccb9] text-center text-sm font-semibold text-[#36513c] ring-1 ring-[#b4c6b0] dark:from-[#3a4d41] dark:to-[#2b3a31] dark:text-[#c9d9c5] dark:ring-[#4a5f52]">
            Sin portada
          </div>
        ) : null}
        <div className="flex-1 rounded-xl border border-[#d5dfd2] bg-[#f4f8f2]/90 p-5 dark:border-[#4a5f52] dark:bg-[#26352d]/75">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{book.title}</h1>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <p className="text-slate-700 dark:text-slate-200"><span className="font-semibold">Autor:</span> {book.author}</p>
            <p className="text-slate-700 dark:text-slate-200"><span className="font-semibold">Género:</span> {book.genre}</p>
            <p className="text-slate-700 dark:text-slate-200"><span className="font-semibold">Estado:</span> {book.status}</p>
            <p className="text-slate-700 dark:text-slate-200"><span className="font-semibold">Calificación:</span> {book.rating ?? "-"}</p>
            <p className="text-slate-700 dark:text-slate-200"><span className="font-semibold">Progreso:</span> {book.progress ?? 0}%</p>
          </div>
          <div className="mt-4">
            <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Reseña</h2>
            <p className="text-slate-700 dark:text-slate-200">{book.review ?? "Sin reseña"}</p>
          </div>
        </div>
      </div>
      <div className="flex justify-end border-t border-[#d5dfd2] pt-4 dark:border-[#3d5346]">
        <Link to={`/books/${book.id}/edit`}>
          <Button size="sm">Editar</Button>
        </Link>
      </div>
    </section>
  );
};
