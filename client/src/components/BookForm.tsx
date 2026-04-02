// Formulario controlado reutilizable para crear y editar libros.
import { FormEvent, KeyboardEvent, useState } from "react";
import { CreateBookDto, ReadingStatus } from "../types/book";

interface BookFormProps {
  onSubmit: (data: CreateBookDto) => Promise<void>;
  initialValues?: Partial<CreateBookDto>;
  submitLabel?: string;
}

type Errors = Partial<Record<keyof CreateBookDto, string>>;

const getProgressByStatus = (status: ReadingStatus, currentProgress?: number): number => {
  if (status === "leido") return 100;
  if (status === "pendiente") return 0;
  return currentProgress ?? 0;
};

export const BookForm = ({
  onSubmit,
  initialValues,
  submitLabel = "Guardar libro"
}: BookFormProps) => {
  const initialStatus = initialValues?.status ?? "pendiente";
  const [form, setForm] = useState<CreateBookDto>({
    title: initialValues?.title ?? "",
    author: initialValues?.author ?? "",
    genre: initialValues?.genre ?? "",
    status: initialStatus,
    rating: initialValues?.rating,
    review: initialValues?.review ?? "",
    progress: getProgressByStatus(initialStatus, initialValues?.progress),
    coverUrl: initialValues?.coverUrl ?? ""
  });
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [coverSearch, setCoverSearch] = useState("");
  const [coverResults, setCoverResults] = useState<string[]>([]);
  const [coverLoading, setCoverLoading] = useState(false);
  const [coverError, setCoverError] = useState<string | null>(null);

  const validate = () => {
    const nextErrors: Errors = {};
    if (!form.title.trim()) nextErrors.title = "El título es requerido";
    if (!form.author.trim()) nextErrors.author = "El autor es requerido";
    if (!form.genre.trim()) nextErrors.genre = "El género es requerido";
    if (form.rating !== undefined && (form.rating < 0 || form.rating > 5)) {
      nextErrors.rating = "La calificación debe estar entre 0 y 5";
    }
    if (form.progress !== undefined && (form.progress < 0 || form.progress > 100)) {
      nextErrors.progress = "El progreso debe estar entre 0 y 100";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload: CreateBookDto = {
        ...form,
        progress: getProgressByStatus(form.status, form.progress)
      };
      await onSubmit(payload);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSearchCovers = async () => {
    const query = coverSearch.trim() || form.title.trim();
    if (!query) {
      setCoverError("Escribe un título para buscar portadas");
      return;
    }

    try {
      setCoverLoading(true);
      setCoverError(null);
      const apiBase = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000/api/v1";
      const response = await fetch(
        `${apiBase}/covers/search?title=${encodeURIComponent(query)}`
      );
      const payload = (await response.json()) as { data?: string[]; error?: string };

      if (!response.ok) {
        setCoverResults([]);
        setCoverError(payload.error ?? "No se pudo buscar portadas en este momento");
        return;
      }

      const urls = payload.data ?? [];

      setCoverResults(urls);
      if (urls.length === 0) {
        setCoverError("No se encontraron portadas para esa búsqueda");
      }
    } catch {
      setCoverError("No se pudo buscar portadas en este momento");
    } finally {
      setCoverLoading(false);
    }
  };

  const handleCoverSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    if (coverLoading) return;
    void handleSearchCovers();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-indigo-100 bg-gradient-to-br from-white to-indigo-50/40 p-6 shadow-sm dark:border-indigo-900/40 dark:from-slate-900 dark:to-indigo-950/20">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Título</label>
        <input
          value={form.title}
          onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
          onKeyDown={handleCoverSearchKeyDown}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:border-slate-500"
        />
        {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Autor</label>
        <input
          value={form.author}
          onChange={(event) => setForm((prev) => ({ ...prev, author: event.target.value }))}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:border-slate-500"
        />
        {errors.author && <p className="mt-1 text-xs text-red-600">{errors.author}</p>}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Género</label>
        <input
          value={form.genre}
          onChange={(event) => setForm((prev) => ({ ...prev, genre: event.target.value }))}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:border-slate-500"
        />
        {errors.genre && <p className="mt-1 text-xs text-red-600">{errors.genre}</p>}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Reseña</label>
        <textarea
          value={form.review ?? ""}
          onChange={(event) => setForm((prev) => ({ ...prev, review: event.target.value }))}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:border-slate-500"
          rows={3}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">URL de portada</label>
        <input
          value={form.coverUrl ?? ""}
          onChange={(event) => setForm((prev) => ({ ...prev, coverUrl: event.target.value }))}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:border-slate-500"
        />
      </div>

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/60">
        <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-200">Buscar portada automática</p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            value={coverSearch}
            onChange={(event) => setCoverSearch(event.target.value)}
            onKeyDown={handleCoverSearchKeyDown}
            placeholder="Ej: Señor de los Anillos"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:border-slate-500"
          />
          <button
            type="button"
            onClick={() => void handleSearchCovers()}
            className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500"
          >
            Buscar
          </button>
        </div>
        {coverLoading && <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">Buscando portadas...</p>}
        {coverError && <p className="mt-2 text-xs text-red-600">{coverError}</p>}

        {coverResults.length > 0 && (
          <div className="mt-3 grid grid-cols-4 gap-2">
            {coverResults.map((url) => (
              <button
                key={url}
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, coverUrl: url }))}
                className="overflow-hidden rounded border border-slate-200 dark:border-slate-700"
              >
                <img src={url} alt="Portada sugerida" className="h-24 w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {form.coverUrl && (
        <div>
          <p className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-200">Vista previa</p>
          <img
            src={form.coverUrl}
            alt="Vista previa de portada"
            className="h-44 w-32 rounded object-cover"
          />
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Estado</label>
        <select
          value={form.status}
          onChange={(event) => {
            const nextStatus = event.target.value as ReadingStatus;
            setForm((prev) => ({
              ...prev,
              status: nextStatus,
              progress: getProgressByStatus(nextStatus, prev.progress)
            }));
          }}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-slate-500"
        >
          <option value="pendiente">pendiente</option>
          <option value="leyendo">leyendo</option>
          <option value="leido">leido</option>
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Calificación</label>
        <input
          type="number"
          value={form.rating ?? ""}
          onChange={(event) =>
            setForm((prev) => ({
              ...prev,
              rating: event.target.value === "" ? undefined : Number(event.target.value)
            }))
          }
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-slate-500"
        />
        {errors.rating && <p className="mt-1 text-xs text-red-600">{errors.rating}</p>}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Progreso</label>
        <input
          type="number"
          value={form.progress ?? ""}
          onChange={(event) =>
            setForm((prev) => ({
              ...prev,
              progress:
                prev.status !== "leyendo"
                  ? getProgressByStatus(prev.status, prev.progress)
                  : event.target.value === ""
                    ? undefined
                    : Number(event.target.value)
            }))
          }
          disabled={form.status !== "leyendo"}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-slate-500"
        />
        {form.status !== "leyendo" && (
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            El progreso se ajusta automáticamente según el estado.
          </p>
        )}
        {errors.progress && <p className="mt-1 text-xs text-red-600">{errors.progress}</p>}
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-60"
      >
        {submitting ? "Guardando..." : submitLabel}
      </button>
    </form>
  );
};
