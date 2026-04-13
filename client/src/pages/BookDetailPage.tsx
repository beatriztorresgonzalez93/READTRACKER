// Página de detalle de un libro con acciones de volver y editar.
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getBookById } from "../api/client";
import { StarRating } from "../components/StarRating";
import { Alert } from "../components/ui/alert";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Book, ReadingStatus } from "../types/book";

const statusChipClass: Record<ReadingStatus, string> = {
  pendiente:
    "inline-flex rounded-full border border-yellow-300 bg-yellow-100/95 px-3 py-1 text-sm font-bold text-yellow-900 dark:border-yellow-500 dark:bg-yellow-900/80 dark:text-yellow-100",
  leyendo:
    "inline-flex rounded-full border border-[#b9d3bf] bg-[#e4f0e3]/95 px-3 py-1 text-sm font-bold text-[#2f4a36] dark:border-[#6f8b75] dark:bg-[#304237]/85 dark:text-[#d7e7d5]",
  leido:
    "inline-flex rounded-full border border-emerald-300 bg-emerald-100/95 px-3 py-1 text-sm font-bold text-emerald-900 dark:border-emerald-500 dark:bg-emerald-900/80 dark:text-emerald-100"
};

const statusLabel: Record<ReadingStatus, string> = {
  pendiente: "Pendiente",
  leyendo: "Leyendo",
  leido: "Leído"
};

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  } catch {
    return iso;
  }
}

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

  const progress = useMemo(() => Math.max(0, Math.min(100, book?.progress ?? 0)), [book?.progress]);

  if (loading) {
    return (
      <p className="font-['DM_Sans',sans-serif] text-sm text-slate-600 dark:text-slate-300">
        Cargando detalle...
      </p>
    );
  }
  if (error || !book) return <Alert variant="destructive">{error ?? "Error"}</Alert>;

  const coverBlock =
    book.coverUrl && !coverBroken ? (
      <img
        src={book.coverUrl}
        alt={`Portada de ${book.title}`}
        className="relative z-10 w-full max-w-[min(100%,320px)] rounded-xl object-cover shadow-[0_20px_50px_-15px_rgba(47,74,54,0.45)] ring-2 ring-white/80 dark:ring-[#3d5346]/80"
        onError={() => setCoverBroken(true)}
      />
    ) : book.coverUrl && coverBroken ? (
      <div className="relative z-10 flex aspect-[2/3] w-full max-w-[min(100%,320px)] items-center justify-center rounded-xl bg-gradient-to-br from-[#d5e2d3] via-[#c5d8c2] to-[#a8c0a5] text-center text-sm font-semibold text-[#36513c] shadow-inner dark:from-[#3a4d41] dark:via-[#314238] dark:to-[#26352d] dark:text-[#c9d9c5]">
        Sin portada
      </div>
    ) : (
      <div className="relative z-10 flex aspect-[2/3] w-full max-w-[min(100%,320px)] items-center justify-center rounded-xl border-2 border-dashed border-[#a7bda9] bg-[#f4f8f2]/90 text-sm text-[#5e7562] dark:border-[#4a5f52] dark:bg-[#26352d]/60 dark:text-[#9fb39e]">
        Sin portada
      </div>
    );

  const hasReview = Boolean(book.review?.trim());

  return (
    <div className="space-y-8 font-['DM_Sans',sans-serif]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/"
          className="text-sm font-semibold text-[#45634b] underline-offset-4 hover:underline dark:text-[#b8ccb9]"
        >
          ← Volver a la biblioteca
        </Link>
        <Link to={`/books/${book.id}/edit`}>
          <Button size="sm">Editar libro</Button>
        </Link>
      </div>

      <div className="relative overflow-hidden rounded-3xl border border-[#d5dfd2] bg-gradient-to-br from-[#f8fbf6] via-[#eef4eb] to-[#e2eadf] shadow-md dark:border-[#3d5346] dark:from-[#2a382f] dark:via-[#233229] dark:to-[#1c2922]">
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#c5d8c2]/35 blur-3xl dark:bg-[#4a6b52]/20"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-20 -left-16 h-64 w-64 rounded-full bg-[#d8e5d4]/50 blur-3xl dark:bg-[#1f2b25]/80"
          aria-hidden
        />

        <div className="relative grid gap-10 p-6 sm:p-8 lg:grid-cols-[minmax(0,340px)_1fr] lg:items-start lg:gap-12">
          <div className="animate-fade-in-soft flex flex-col items-center lg:items-start">
            <div className="relative w-full max-w-[320px]">
              <div
                className="absolute -inset-3 -z-0 rounded-2xl bg-gradient-to-br from-[#8ea892]/40 to-[#5f7a65]/25 opacity-80 dark:from-[#4a6b52]/30 dark:to-[#1f2b25]/60"
                aria-hidden
              />
              <div className="absolute -bottom-2 left-4 right-4 h-4 rounded-full bg-black/10 blur-md dark:bg-black/40" aria-hidden />
              {coverBlock}
            </div>
            <dl className="mt-8 w-full max-w-[320px] space-y-3 rounded-2xl border border-[#d5dfd2]/80 bg-white/60 p-4 text-sm backdrop-blur-sm dark:border-[#4a5f52]/60 dark:bg-[#1f2b25]/50">
              <div className="flex justify-between gap-3 border-b border-[#d5dfd2]/60 pb-3 dark:border-[#4a5f52]/40">
                <dt className="text-slate-500 dark:text-slate-400">Añadido</dt>
                <dd className="text-right font-medium text-slate-800 dark:text-slate-100">
                  {formatDate(book.createdAt)}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500 dark:text-slate-400">Última actualización</dt>
                <dd className="text-right font-medium text-slate-800 dark:text-slate-100">
                  {formatDate(book.updatedAt)}
                </dd>
              </div>
            </dl>
          </div>

          <div className="animate-slide-in-right-soft min-w-0 space-y-8">
            <header className="space-y-4">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#5f7a65] dark:text-[#9eb79f]">
                Ficha de lectura
              </p>
              <h1 className="font-['Fraunces',serif] text-4xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-5xl dark:text-slate-50">
                {book.title}
              </h1>
              <p className="text-xl font-medium italic text-slate-600 dark:text-slate-300">{book.author}</p>
              <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <span className="rounded-md bg-[#d5e2d3]/80 px-2.5 py-1 font-semibold text-[#2f4a36] dark:bg-[#26352d] dark:text-[#c9d9c5]">
                  {book.genre}
                </span>
                <span aria-hidden className="text-slate-300 dark:text-slate-600">
                  ·
                </span>
                <span className={statusChipClass[book.status]}>{statusLabel[book.status]}</span>
              </div>
            </header>

            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="border-[#d5dfd2] bg-white/85 dark:border-[#4a5f52] dark:bg-[#26352d]/70">
                <CardContent className="space-y-2 p-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Valoración
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                    <StarRating rating={book.rating} className="text-2xl leading-none" />
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                      {book.rating != null ? `${book.rating} / 5` : "Sin puntuar"}
                    </span>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-[#d5dfd2] bg-white/85 dark:border-[#4a5f52] dark:bg-[#26352d]/70">
                <CardContent className="space-y-3 p-5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Avance
                    </p>
                    <span className="rounded-lg bg-[#dbe7d8] px-2.5 py-1 font-['Fraunces',serif] text-2xl font-semibold tabular-nums text-[#45634b] shadow-sm dark:bg-[#32443a] dark:text-[#d7e7d5]">
                      {progress}%
                    </span>
                  </div>
                  <div className="h-3.5 w-full overflow-hidden rounded-full bg-[#d5e2d3] ring-1 ring-[#bdd0bc] dark:bg-[#1f2b25] dark:ring-[#42594c]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#4f6955] via-[#6f8f75] to-[#a9bea9] transition-[width] duration-700"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {progress >= 100 ? "Libro completado" : progress >= 60 ? "Buen ritmo de lectura" : "Lectura en curso"}
                  </p>
                </CardContent>
              </Card>
            </div>

            <section className="rounded-2xl border border-[#d5dfd2] bg-white/90 p-6 shadow-sm dark:border-[#4a5f52] dark:bg-[#1f2b25]/55">
              <div className="mb-4 flex items-center gap-2">
                <span className="font-['Fraunces',serif] text-3xl leading-none text-[#5f7a65]/50 dark:text-[#7b9982]/60" aria-hidden>
                  “
                </span>
                <h2 className="font-['Fraunces',serif] text-xl font-semibold text-slate-900 dark:text-slate-100">
                  Reseña
                </h2>
              </div>
              <p
                className={`min-h-[8rem] whitespace-pre-wrap text-base leading-[1.9] text-slate-700 dark:text-slate-200 ${!hasReview ? "italic text-slate-500 dark:text-slate-400" : "first-letter:mr-1 first-letter:float-left first-letter:font-['Fraunces',serif] first-letter:text-4xl first-letter:leading-[0.9] first-letter:text-[#5f7a65] dark:first-letter:text-[#a5bda6]"}`}
              >
                {hasReview ? book.review : "Todavía no escribiste una reseña. Cuando la tengas, aparecerá aquí con calma de cuaderno de lectura."}
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};
