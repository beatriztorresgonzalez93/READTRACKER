// Formulario controlado reutilizable para crear y editar libros.
import { FormEvent, KeyboardEvent, useEffect, useState } from "react";
import { API_BASE_URL } from "../api/client";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { FormError } from "./ui/form-error";
import { Input } from "./ui/input";
import { CreateBookDto } from "../types/book";

interface BookFormProps {
  onSubmit: (data: CreateBookDto) => Promise<void>;
  initialValues?: Partial<CreateBookDto>;
  submitLabel?: string;
}

type Errors = Partial<Record<keyof CreateBookDto, string>>;

export const BookForm = ({
  onSubmit,
  initialValues,
  submitLabel = "Guardar libro"
}: BookFormProps) => {
  const [form, setForm] = useState<CreateBookDto>({
    title: initialValues?.title ?? "",
    author: initialValues?.author ?? "",
    publisher: initialValues?.publisher ?? "",
    genre: initialValues?.genre ?? "",
    publicationYear: initialValues?.publicationYear,
    status: initialValues?.status ?? "pendiente",
    progress: initialValues?.progress ?? 0,
    coverUrl: initialValues?.coverUrl ?? ""
  });
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [coverSearch, setCoverSearch] = useState("");
  const [coverResults, setCoverResults] = useState<string[]>([]);
  const [coverLoading, setCoverLoading] = useState(false);
  const [coverError, setCoverError] = useState<string | null>(null);
  const [previewCoverBroken, setPreviewCoverBroken] = useState(false);

  useEffect(() => {
    setPreviewCoverBroken(false);
  }, [form.coverUrl]);

  const validate = () => {
    const currentYear = new Date().getFullYear() + 1;
    const nextErrors: Errors = {};
    if (!form.title.trim()) nextErrors.title = "El título es requerido";
    if (!form.author.trim()) nextErrors.author = "El autor es requerido";
    if (!form.publisher.trim()) nextErrors.publisher = "La editorial es requerida";
    if (!form.genre.trim()) nextErrors.genre = "El género es requerido";
    if (
      form.publicationYear !== undefined &&
      (!Number.isInteger(form.publicationYear) ||
        form.publicationYear < 0 ||
        form.publicationYear > currentYear)
    ) {
      nextErrors.publicationYear = "El año de publicación no es válido";
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
        status: initialValues?.status ?? "pendiente",
        progress: initialValues?.progress ?? 0,
        rating: initialValues?.rating,
        review: initialValues?.review
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
      const response = await fetch(
        `${API_BASE_URL}/covers/search?title=${encodeURIComponent(query)}`
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
    <form onSubmit={handleSubmit}>
      <Card className="bg-gradient-to-br from-white to-cyan-50/40 dark:from-slate-900 dark:to-cyan-950/20 dark:ring-1 dark:ring-cyan-900/40">
        <CardContent className="space-y-4 p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Título</label>
              <Input
                value={form.title}
                maxLength={120}
                onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                onKeyDown={handleCoverSearchKeyDown}
              />
              {errors.title && <FormError>{errors.title}</FormError>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Autor</label>
              <Input
                value={form.author}
                maxLength={80}
                onChange={(event) => setForm((prev) => ({ ...prev, author: event.target.value }))}
              />
              {errors.author && <FormError>{errors.author}</FormError>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
                Editorial
              </label>
              <Input
                value={form.publisher}
                maxLength={80}
                onChange={(event) => setForm((prev) => ({ ...prev, publisher: event.target.value }))}
              />
              {errors.publisher && <FormError>{errors.publisher}</FormError>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
                Año de publicación
              </label>
              <Input
                type="number"
                value={form.publicationYear ?? ""}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    publicationYear: event.target.value === "" ? undefined : Number(event.target.value)
                  }))
                }
              />
              {errors.publicationYear && <FormError>{errors.publicationYear}</FormError>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Género</label>
              <Input
                value={form.genre}
                maxLength={60}
                onChange={(event) => setForm((prev) => ({ ...prev, genre: event.target.value }))}
              />
              {errors.genre && <FormError>{errors.genre}</FormError>}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
              URL de portada
            </label>
            <Input
              value={form.coverUrl ?? ""}
              onChange={(event) => setForm((prev) => ({ ...prev, coverUrl: event.target.value }))}
            />
          </div>

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/60">
        <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-200">Buscar portada automática</p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            value={coverSearch}
            onChange={(event) => setCoverSearch(event.target.value)}
            onKeyDown={handleCoverSearchKeyDown}
            placeholder="Ej: Señor de los Anillos"
          />
          <Button type="button" onClick={() => void handleSearchCovers()} className="sm:min-w-[110px]">
            Buscar
          </Button>
        </div>
        {coverLoading && <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">Buscando portadas...</p>}
        {coverError && <FormError className="mt-2">{coverError}</FormError>}

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
          {!previewCoverBroken ? (
            <img
              src={form.coverUrl}
              alt="Vista previa de portada"
              className="h-44 w-32 rounded object-cover"
              onError={() => setPreviewCoverBroken(true)}
            />
          ) : (
            <div className="flex h-44 w-32 items-center justify-center rounded bg-gradient-to-b from-cyan-100 to-cyan-200 text-center text-xs font-semibold text-cyan-700 dark:from-cyan-900/40 dark:to-cyan-800/40 dark:text-cyan-300">
              Sin portada
            </div>
          )}
        </div>
      )}

      <Button type="submit" disabled={submitting}>
        {submitting ? "Guardando..." : submitLabel}
      </Button>
        </CardContent>
      </Card>
    </form>
  );
};
