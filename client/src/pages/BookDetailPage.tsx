// Página de detalle de un libro con acciones de volver y editar.
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getBookById, updateBook } from "../api/client";
import { PencilLine } from "lucide-react";
import { Alert } from "../components/ui/alert";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Select } from "../components/ui/select";
import { Book } from "../types/book";

const statusChipClass: Record<Book["status"], string> = {
  pendiente:
    "inline-flex rounded-full border border-yellow-300 bg-yellow-100/95 px-3 py-1 text-sm font-bold text-yellow-900 dark:border-yellow-500 dark:bg-yellow-900/80 dark:text-yellow-100",
  leyendo:
    "inline-flex rounded-full border border-cyan-300 bg-cyan-100/95 px-3 py-1 text-sm font-bold text-cyan-900 dark:border-cyan-500 dark:bg-cyan-900/80 dark:text-cyan-100",
  leido:
    "inline-flex rounded-full border border-emerald-300 bg-emerald-100/95 px-3 py-1 text-sm font-bold text-emerald-900 dark:border-emerald-500 dark:bg-emerald-900/80 dark:text-emerald-100"
};

const statusLabel: Record<Book["status"], string> = {
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
  const [status, setStatus] = useState<Book["status"]>("pendiente");
  const [rating, setRating] = useState<number | undefined>(undefined);
  const [review, setReview] = useState("");
  const [progressInput, setProgressInput] = useState<number>(0);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isEditingReview, setIsEditingReview] = useState(false);
  const lastSavedRef = useRef<string>("");
  const reviewInputRef = useRef<HTMLTextAreaElement | null>(null);

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
        setStatus(data.status);
        setRating(data.rating);
        setReview(data.review ?? "");
        setProgressInput(Math.max(0, Math.min(100, data.progress ?? 0)));
        const initialSnapshot = JSON.stringify({
          status: data.status,
          rating: data.status === "leido" ? data.rating ?? undefined : undefined,
          review: data.status === "leido" ? data.review ?? "" : "",
          progress:
            data.status === "pendiente" ? 0 : data.status === "leido" ? 100 : Math.max(0, Math.min(100, data.progress ?? 0))
        });
        lastSavedRef.current = initialSnapshot;
        setIsEditingReview(false);
      } catch {
        setError("No se encontró el libro");
      } finally {
        setLoading(false);
      }
    };

    void loadBook();
  }, [id]);

  const progress = useMemo(() => {
    if (status === "pendiente") return 0;
    if (status === "leido") return 100;
    return Math.max(0, Math.min(100, progressInput));
  }, [progressInput, status]);

  useEffect(() => {
    if (!book) return;

    const payload = {
      status,
      rating: status === "leido" ? rating : undefined,
      review: status === "leido" ? review : undefined,
      progress
    };
    const snapshot = JSON.stringify(payload);
    if (snapshot === lastSavedRef.current) return;

    const timeoutId = setTimeout(async () => {
      try {
        setSaveError(null);
        setSaveState("saving");
        const updated = await updateBook(book.id, payload);
        setBook(updated);
        lastSavedRef.current = snapshot;
        setSaveState("saved");
      } catch {
        setSaveError("No se pudo guardar automáticamente");
        setSaveState("error");
      }
    }, 650);

    return () => clearTimeout(timeoutId);
  }, [book, progress, rating, review, status]);

  useEffect(() => {
    if (!isEditingReview) return;
    reviewInputRef.current?.focus();
  }, [isEditingReview]);

  if (loading) {
    return (
      <section className="space-y-6 font-['DM_Sans',sans-serif]">
        <div className="h-5 w-44 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white/70 p-6 dark:border-slate-800 dark:bg-slate-900/70 sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,340px)_1fr]">
            <div className="aspect-[2/3] max-w-[320px] animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
            <div className="space-y-4">
              <div className="h-4 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
              <div className="h-10 w-4/5 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
              <div className="h-6 w-1/2 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="h-24 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
                <div className="h-24 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
              </div>
              <div className="h-36 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
            </div>
          </div>
        </div>
      </section>
    );
  }
  if (error || !book) return <Alert variant="destructive">{error ?? "Error"}</Alert>;

  const coverBlock =
    book.coverUrl && !coverBroken ? (
      <img
        src={book.coverUrl}
        alt={`Portada de ${book.title}`}
        className="relative z-10 w-full max-w-[min(100%,320px)] rounded-xl object-cover shadow-[0_20px_50px_-15px_rgba(8,145,178,0.45)] ring-2 ring-white/80 dark:ring-cyan-900/40"
        onError={() => setCoverBroken(true)}
      />
    ) : (
      <div className="relative z-10 flex aspect-[2/3] w-full max-w-[min(100%,320px)] items-center justify-center rounded-xl bg-gradient-to-br from-cyan-100 via-cyan-200 to-cyan-300 text-center text-sm font-semibold text-cyan-800 shadow-inner dark:from-cyan-900/40 dark:via-cyan-800/40 dark:to-cyan-700/30 dark:text-cyan-200">
        Sin portada
      </div>
    );

  return (
    <div className="space-y-8 font-['DM_Sans',sans-serif]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to="/" className="text-sm font-semibold text-cyan-700 underline-offset-4 hover:underline dark:text-cyan-300">
          ← Volver a la biblioteca
        </Link>
        <Link to={`/books/${book.id}/edit`}>
          <Button size="sm">Editar</Button>
        </Link>
      </div>

      <div className="animate-fade-in-soft relative overflow-hidden rounded-3xl border border-slate-200 bg-[radial-gradient(circle_at_bottom_right,_#d6efff_0%,_#f8fafc_48%,_#f1f5f9_100%)] shadow-md transition-shadow duration-300 hover:shadow-[0_28px_70px_-18px_rgba(37,99,235,0.52)] dark:border-slate-800 dark:bg-[radial-gradient(1100px_560px_at_108%_112%,_rgba(34,211,238,0.26)_0%,_rgba(14,116,144,0.34)_26%,_rgba(15,23,42,0.93)_70%,_#020617_100%)] dark:hover:shadow-[0_0_36px_rgba(0,183,255,0.55),0_32px_80px_-20px_rgba(8,47,73,0.95)]">
        <div className="pointer-events-none absolute -right-24 -bottom-24 h-72 w-72 rounded-full bg-cyan-200/30 blur-3xl dark:bg-cyan-400/15" aria-hidden />
        <div className="pointer-events-none absolute -top-20 -left-16 h-64 w-64 rounded-full bg-cyan-100/25 blur-3xl dark:bg-indigo-900/30" aria-hidden />

        <div className="relative grid gap-10 p-6 sm:p-8 lg:grid-cols-[minmax(0,340px)_1fr] lg:items-start lg:gap-12">
          <div className="animate-slide-in-up-soft flex flex-col items-center lg:items-start">
            <div className="relative w-full max-w-[320px] transition-transform duration-500 hover:-translate-y-1">
              <div className="absolute -inset-3 -z-0 rounded-2xl bg-gradient-to-tl from-cyan-200/45 to-cyan-500/25 opacity-80 dark:from-cyan-900/30 dark:to-slate-900/60" aria-hidden />
              <div className="absolute -bottom-2 left-4 right-4 h-4 rounded-full bg-black/10 blur-md dark:bg-black/40" aria-hidden />
              {coverBlock}
            </div>
            <dl className="mt-8 w-full max-w-[320px] space-y-3 rounded-2xl border border-slate-200/80 bg-white/60 p-4 text-sm backdrop-blur-sm dark:border-slate-700/60 dark:bg-slate-900/50">
              {book.publicationYear != null && (
                <div className="flex justify-between gap-3 border-b border-slate-200/80 pb-3 dark:border-slate-700/40">
                  <dt className="text-slate-500 dark:text-slate-400">Publicación</dt>
                  <dd className="text-right font-medium text-slate-800 dark:text-slate-100">
                    {book.publicationYear}
                  </dd>
                </div>
              )}
              <div className="flex justify-between gap-3 border-b border-slate-200/80 pb-3 dark:border-slate-700/40">
                <dt className="text-slate-500 dark:text-slate-400">Añadido</dt>
                <dd className="text-right font-medium text-slate-800 dark:text-slate-100">{formatDate(book.createdAt)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500 dark:text-slate-400">Última actualización</dt>
                <dd className="text-right font-medium text-slate-800 dark:text-slate-100">{formatDate(book.updatedAt)}</dd>
              </div>
            </dl>
          </div>

          <div className="animate-slide-in-up-soft min-w-0 space-y-8" style={{ animationDelay: "80ms" }}>
            <header className="space-y-4">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-700 dark:text-cyan-300">Ficha de lectura</p>
              <h1 className="font-['Fraunces',serif] text-4xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-5xl dark:text-slate-50">{book.title}</h1>
              <p className="text-xl font-medium italic text-slate-600 dark:text-slate-300">{book.author}</p>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{book.publisher}</p>
              <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <span className="rounded-md bg-cyan-100/80 px-2.5 py-1 font-semibold text-cyan-900 dark:bg-cyan-950/40 dark:text-cyan-200">{book.genre}</span>
                {book.publicationYear != null && (
                  <>
                    <span aria-hidden className="text-slate-300 dark:text-slate-600">·</span>
                    <span className="rounded-md bg-slate-100/90 px-2.5 py-1 font-semibold text-slate-700 dark:bg-slate-800/90 dark:text-slate-200">
                      {book.publicationYear}
                    </span>
                  </>
                )}
                <span aria-hidden className="text-slate-300 dark:text-slate-600">·</span>
                <span className={statusChipClass[status]}>{statusLabel[status]}</span>
              </div>
            </header>

            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="border-slate-200 bg-white/85 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-900/70 dark:hover:shadow-cyan-900/20">
                <CardContent className="space-y-2 p-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Valoración</p>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }, (_, index) => {
                        const value = index + 1;
                        const active = (rating ?? 0) >= value;
                        return (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setRating((prev) => (prev === value ? undefined : value))}
                            className={`text-2xl leading-none transition-transform hover:scale-110 ${
                              active ? "text-amber-500 drop-shadow-sm dark:text-amber-400" : "text-slate-300 dark:text-slate-600"
                            }`}
                            aria-label={`Valorar con ${value} estrella${value > 1 ? "s" : ""}`}
                          >
                            ★
                          </button>
                        );
                      })}
                    </div>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                      {rating != null ? `${rating} / 5` : "Sin puntuar"}
                    </span>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-slate-200 bg-white/85 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-900/70 dark:hover:shadow-cyan-900/20">
                <CardContent className="space-y-3 p-5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Avance</p>
                    <span className="font-['Fraunces',serif] text-2xl font-semibold tabular-nums text-cyan-700 transition-transform duration-300 hover:scale-110 dark:text-cyan-300">{progress}%</span>
                  </div>
                  <Select
                    value={status}
                    onChange={(event) => {
                      const nextStatus = event.target.value as Book["status"];
                      setStatus(nextStatus);
                      if (nextStatus === "pendiente") {
                        setProgressInput(0);
                        setRating(undefined);
                        setReview("");
                      } else if (nextStatus === "leido") {
                        setProgressInput(100);
                      }
                    }}
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="leyendo">Leyendo</option>
                    <option value="leido">Leído</option>
                  </Select>
                  {status === "leyendo" && (
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={progressInput}
                      onChange={(event) => setProgressInput(Number(event.target.value))}
                      className="h-8 w-full rounded-lg border border-slate-300 bg-white px-2.5 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    />
                  )}
                  <div className="h-3 w-full overflow-hidden rounded-full bg-cyan-100 dark:bg-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-sky-500 transition-[width,filter] duration-700 hover:brightness-110"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <section className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm transition-all duration-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-900/55 dark:hover:shadow-cyan-900/20">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-3xl leading-none text-cyan-700/45 dark:text-cyan-300/60" aria-hidden>“</span>
                  <h2 className="font-['Fraunces',serif] text-xl font-semibold text-slate-900 dark:text-slate-100">Reseña</h2>
                </div>
                <span
                  className={`text-xs font-medium ${
                    saveState === "saving"
                      ? "text-cyan-700 dark:text-cyan-300"
                      : saveState === "saved"
                        ? "text-emerald-700 dark:text-emerald-300"
                        : saveState === "error"
                          ? "text-rose-700 dark:text-rose-300"
                          : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {saveState === "saving" && "Guardando..."}
                  {saveState === "saved" && "Guardado automático"}
                  {saveState === "error" && "Error al guardar"}
                  {saveState === "idle" && ""}
                </span>
              </div>
              {status === "leido" ? (
                isEditingReview ? (
                  <textarea
                    ref={reviewInputRef}
                    value={review}
                    onChange={(event) => setReview(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key !== "Enter" || event.shiftKey) return;
                      event.preventDefault();
                      setIsEditingReview(false);
                    }}
                    rows={6}
                    placeholder="Escribe tu reseña..."
                    className="flex min-h-[10rem] w-full rounded-xl border border-slate-200 bg-slate-50/80 px-2.5 py-2 text-base leading-relaxed text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus-visible:border-cyan-500 focus-visible:ring-2 focus-visible:ring-cyan-500/35 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:placeholder:text-slate-500"
                  />
                ) : (
                  <div className="relative rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/40">
                    <button
                      type="button"
                      onClick={() => setIsEditingReview(true)}
                      aria-label="Editar reseña"
                      title="Editar reseña"
                      className="absolute bottom-3 right-3 inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-600 transition hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                      <PencilLine className="h-4 w-4" />
                    </button>
                    <p className="min-h-[8rem] whitespace-pre-wrap pr-12 text-base leading-[1.8] text-slate-700 dark:text-slate-200">
                      {review.trim() ? review : "Pulsa el icono para escribir tu reseña."}
                    </p>
                  </div>
                )
              ) : (
                <p className="min-h-[4rem] rounded-xl border border-dashed border-slate-300 bg-slate-50/70 px-4 py-3 italic text-slate-500 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-400">
                  La reseña se habilita automáticamente cuando marques el libro como leído.
                </p>
              )}
              {saveError && <p className="mt-3 text-xs text-rose-700 dark:text-rose-300">{saveError}</p>}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};
