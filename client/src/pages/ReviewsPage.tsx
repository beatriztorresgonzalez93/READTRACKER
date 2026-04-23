// Página de reseñas con búsqueda, filtro por estrellas y orden.
import { useEffect, useMemo, useState } from "react";
import { BookOpen, Bookmark, Clock3, Heart } from "lucide-react";
import { Alert } from "../components/ui/alert";
import { Input } from "../components/ui/input";
import { Select } from "../components/ui/select";
import { useBooksContext } from "../context/BooksContext";

type RatingFilter = "todas" | "1" | "2" | "3" | "4" | "5";
type ReviewSort = "reciente" | "valoracion" | "titulo";

export const ReviewsPage = () => {
  const { books, loading, error } = useBooksContext();
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>("todas");
  const [sortBy, setSortBy] = useState<ReviewSort>("reciente");
  const [activeGenre, setActiveGenre] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  const readCount = useMemo(() => books.filter((book) => book.status === "leido").length, [books]);
  const averageRating = useMemo(() => {
    const rated = books.filter(
      (book) => book.status === "leido" && typeof book.rating === "number" && (book.rating ?? 0) > 0
    );
    if (rated.length === 0) return "0.0";
    const total = rated.reduce((acc, item) => acc + (item.rating ?? 0), 0);
    return (total / rated.length).toFixed(1);
  }, [books]);

  const nowReadingBooks = useMemo(
    () =>
      books
        .filter((book) => book.status === "leyendo")
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
    [books]
  );
  const genres = useMemo(() => {
    const counts = new Map<string, number>();
    books.forEach((book) => {
      const normalized = book.genre.trim();
      if (!normalized) return;
      counts.set(normalized, (counts.get(normalized) ?? 0) + 1);
    });
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "es"));
  }, [books]);

  const reviewBooks = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    const filtered = books.filter((book) => {
      const review = book.review?.trim() ?? "";
      if (!review) return false;
      const matchesSearch =
        !normalized ||
        review.toLowerCase().includes(normalized) ||
        book.title.toLowerCase().includes(normalized) ||
        book.author.toLowerCase().includes(normalized);
      const matchesRating = ratingFilter === "todas" || (book.rating ?? 0) === Number(ratingFilter);
      const matchesGenre =
        !activeGenre || book.genre.localeCompare(activeGenre, "es", { sensitivity: "base" }) === 0;
      return matchesSearch && matchesRating && matchesGenre;
    });

    return filtered.toSorted((a, b) => {
      if (sortBy === "titulo") return a.title.localeCompare(b.title, "es", { sensitivity: "base" });
      if (sortBy === "valoracion") return (b.rating ?? -1) - (a.rating ?? -1);
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [activeGenre, books, ratingFilter, search, sortBy]);

  const buildFallbackCover = (seed: string) => {
    const palettes = [
      "linear-gradient(135deg, #123a67 0%, #0b2441 100%)",
      "linear-gradient(135deg, #2f5e24 0%, #183f1a 100%)",
      "linear-gradient(135deg, #6b1d22 0%, #4d1218 100%)",
      "linear-gradient(135deg, #16545a 0%, #0f3a3f 100%)"
    ];
    const index = Math.abs(seed.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0)) % palettes.length;
    return palettes[index];
  };

  return (
    <section className="min-h-full space-y-6 bg-transparent pl-1 pr-4 py-2 text-amber-50 sm:pl-2 sm:pr-6">
      <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
        <aside className="space-y-4">
          <div className="overflow-hidden rounded-xl border border-[#c69253] bg-[#e9dcc4] text-[#4d311d]">
            <p className="border-b border-[#c89c33] bg-[#1a0b06] px-4 py-3 text-xs font-semibold tracking-[0.18em] text-[#e8cf9f]">📚 MI BIBLIOTECA</p>
            <div className="grid grid-cols-2 gap-3 p-4 text-center">
              <div>
                <p className="font-['Fraunces',serif] text-3xl">{books.length}</p>
                <p className="text-[11px] uppercase tracking-[0.12em]">Libros</p>
              </div>
              <div>
                <p className="font-['Fraunces',serif] text-3xl">{readCount}</p>
                <p className="text-[11px] uppercase tracking-[0.12em]">Leídos</p>
              </div>
              <div>
                <p className="font-['Fraunces',serif] text-3xl">{averageRating}</p>
                <p className="text-[11px] uppercase tracking-[0.12em]">Valoración</p>
              </div>
              <div>
                <p className="font-['Fraunces',serif] text-3xl">{reviewBooks.length}</p>
                <p className="text-[11px] uppercase tracking-[0.12em]">Reseñas</p>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-[#c69253] bg-[#e9dcc4] text-[#4d311d]">
            <p className="border-b border-[#c89c33] bg-[#1a0b06] px-4 py-3 text-xs font-semibold tracking-[0.18em] text-[#e8cf9f]">📖 LEYENDO AHORA</p>
            {nowReadingBooks.length > 0 ? (
              <div className="divide-y divide-[#dcc8a7]">
                {nowReadingBooks.slice(0, 2).map((book) => (
                  <div key={book.id} className="px-4 py-2.5">
                    <p className="font-['Fraunces',serif] text-lg leading-tight">{book.title}</p>
                    <p className="text-sm">{book.author}</p>
                    <p className="text-xs">Avance: {book.progress ?? 0}%</p>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[#d9c7ad]">
                      <div
                        className="h-full rounded-full bg-[#8e633d]"
                        style={{ width: `${Math.max(0, Math.min(100, book.progress ?? 0))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="px-4 py-3 text-sm">No hay lectura activa ahora mismo.</p>
            )}
          </div>

          <div className="overflow-hidden rounded-xl border border-[#c69253] bg-[#e9dcc4] text-[#4d311d]">
            <p className="border-b border-[#c89c33] bg-[#1a0b06] px-4 py-3 text-xs font-semibold tracking-[0.18em] text-[#e8cf9f]">🗂️ ESTANTES</p>
            <ul className="divide-y divide-[#dcc8a7] text-sm">
              <li className="flex items-center justify-between px-4 py-2.5">
                <span className="inline-flex items-center gap-2"><BookOpen className="h-3.5 w-3.5" />Todos</span>
                <span className="font-semibold text-[#6f4b2e]">{books.length}</span>
              </li>
              <li className="flex items-center justify-between px-4 py-2.5">
                <span className="inline-flex items-center gap-2"><BookOpen className="h-3.5 w-3.5" />Pendientes</span>
                <span className="font-semibold text-[#6f4b2e]">{books.filter((b) => b.status === "pendiente").length}</span>
              </li>
              <li className="flex items-center justify-between px-4 py-2.5">
                <span className="inline-flex items-center gap-2"><Bookmark className="h-3.5 w-3.5" />Leídos</span>
                <span className="font-semibold text-[#6f4b2e]">{readCount}</span>
              </li>
              <li className="flex items-center justify-between px-4 py-2.5">
                <span className="inline-flex items-center gap-2"><Clock3 className="h-3.5 w-3.5" />En progreso</span>
                <span className="font-semibold text-[#6f4b2e]">{books.filter((b) => b.status === "leyendo").length}</span>
              </li>
              <li className="flex items-center justify-between px-4 py-2.5">
                <span className="inline-flex items-center gap-2"><Heart className="h-3.5 w-3.5" />Favoritos</span>
                <span className="font-semibold text-[#6f4b2e]">{books.filter((b) => b.isFavorite).length}</span>
              </li>
            </ul>
          </div>

          <div className="overflow-hidden rounded-xl border border-[#c69253] bg-[#e9dcc4] text-[#4d311d]">
            <p className="border-b border-[#c89c33] bg-[#1a0b06] px-4 py-3 text-xs font-semibold tracking-[0.18em] text-[#e8cf9f]">🏷️ GÉNEROS</p>
            <ul className="divide-y divide-[#dcc8a7] text-sm">
              <li className="flex items-center justify-between px-4 py-2.5">
                <button
                  type="button"
                  onClick={() => setActiveGenre(null)}
                  className={`line-clamp-1 transition hover:underline ${activeGenre === null ? "font-semibold text-[#5a2f1f] underline" : ""}`}
                >
                  Todos
                </button>
                <span className="font-semibold text-[#6f4b2e]">{books.length}</span>
              </li>
              {genres.map(([genre, count]) => (
                <li key={genre} className="flex items-center justify-between px-4 py-2.5">
                  <button
                    type="button"
                    onClick={() => setActiveGenre((current) => (current === genre ? null : genre))}
                    className={`truncate text-left transition hover:underline ${activeGenre === genre ? "font-semibold text-[#5a2f1f] underline" : ""}`}
                  >
                    {genre}
                  </button>
                  <span className="font-semibold text-[#6f4b2e]">{count}</span>
                </li>
              ))}
              {genres.length === 0 && <li className="px-4 py-3 text-sm">Sin géneros todavía.</li>}
            </ul>
          </div>
        </aside>

        <div className="space-y-4">
          <div className="rounded-md border border-amber-700/60 bg-[#e9dcc4] p-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por palabras en tus reseñas..."
                className="h-9 border-[#b08a63] bg-[#f8f1e5] text-[#4d311d] placeholder:text-[#8d6d4d] sm:flex-1"
              />
              <div className="flex gap-2 sm:ml-auto">
                <Select
                  value={ratingFilter}
                  onChange={(event) => setRatingFilter(event.target.value as RatingFilter)}
                  className="h-9 w-[210px] rounded-md !border-[#8e633d] !bg-[#8e633d] !py-1.5 !text-[#f8f1e5] hover:!bg-[#7c5534] dark:!border-[#8e633d] dark:!bg-[#8e633d] dark:!text-[#f8f1e5]"
                >
                  <option value="todas">Todas las valoraciones</option>
                  <option value="5">5 estrellas</option>
                  <option value="4">4 estrellas</option>
                  <option value="3">3 estrellas</option>
                  <option value="2">2 estrellas</option>
                  <option value="1">1 estrella</option>
                </Select>
                <Select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value as ReviewSort)}
                  className="h-9 w-[210px] rounded-md !border-[#8e633d] !bg-[#8e633d] !py-1.5 !text-[#f8f1e5] hover:!bg-[#7c5534] dark:!border-[#8e633d] dark:!bg-[#8e633d] dark:!text-[#f8f1e5]"
                >
                  <option value="reciente">Ordenar: Reciente</option>
                  <option value="valoracion">Ordenar: Valoración</option>
                  <option value="titulo">Ordenar: Título</option>
                </Select>
              </div>
            </div>
          </div>

          <div className="border-t border-[#d7b06f] pt-4">
            <div className="mb-4 flex items-center justify-between gap-2">
              <p className="font-['Fraunces',serif] text-2xl text-[#5a2f1f] dark:text-amber-100">✦ Mis reseñas</p>
              <span className="text-xs text-[#8e633d] dark:text-amber-200/80">{reviewBooks.length} reseñas escritas</span>
            </div>
            {loading && <p className="rt-body-copy text-amber-100/90">Cargando reseñas...</p>}
            {error && <Alert variant="destructive">{error}</Alert>}
            {!loading && !error && reviewBooks.length === 0 && (
              <div className="rounded-md border border-amber-700/60 bg-[#e9dcc4] p-4 text-sm text-[#4d311d]">
                No hay reseñas que coincidan con la búsqueda.
              </div>
            )}
            {!loading && !error && reviewBooks.length > 0 && (
              <div className="space-y-4">
                {reviewBooks.map((book) => (
                  <article
                    key={book.id}
                    className="rounded-md border border-amber-700/60 bg-[#e9dcc4] p-0 text-[#4d311d] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-[#c89c33] hover:shadow-[0_10px_24px_-18px_rgba(90,47,31,0.75)]"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2 px-4 pb-2 pt-4">
                      <div>
                        <p className="font-['Fraunces',serif] text-[1.9rem] leading-none">{book.title}</p>
                        <p className="text-xs italic text-[#7a573c]">
                          {book.author}
                          {book.publicationYear ? ` · ${book.publicationYear}` : ""}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[1.02rem] leading-none text-[#c89c33]">
                          {"★".repeat(book.rating ?? 0)}
                          {"☆".repeat(Math.max(0, 5 - (book.rating ?? 0)))}
                        </p>
                        <p className="text-[11px] text-[#7a573c]">
                          {new Date(book.updatedAt).toLocaleDateString("es-ES", {
                            day: "numeric",
                            month: "short",
                            year: "numeric"
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="border-t border-[#c4a27b]/70 px-4 py-3">
                      <div className="grid grid-cols-[44px_1fr] gap-3">
                        <div className="h-[58px] w-[44px] overflow-hidden border border-[#8f643f]">
                          {book.coverUrl ? (
                            <img src={book.coverUrl} alt={`Mini portada de ${book.title}`} className="h-full w-full object-cover" />
                          ) : (
                            <div
                              className="h-full w-full"
                              style={{
                                background: buildFallbackCover(book.title)
                              }}
                            />
                          )}
                        </div>
                        <div className="relative min-w-0 pl-5">
                          <span
                            aria-hidden="true"
                            className="pointer-events-none absolute left-0 top-[-2px] font-['Fraunces',serif] text-[2rem] leading-none text-[#ccb070]"
                          >
                            “
                          </span>
                          <p className="text-[1.06rem] leading-relaxed italic text-[#5a3b24]">{book.review?.trim()}</p>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center justify-end gap-2 text-[10px] uppercase tracking-[0.08em] text-[#7a573c]">
                        <span className="border border-[#8f643f] bg-[#8e633d] px-1.5 py-0.5 text-[#f3e7d5]">
                          {book.genre}
                        </span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
