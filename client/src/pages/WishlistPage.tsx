// Página de lista de deseos independiente de la biblioteca.
import { useEffect, useMemo, useState } from "react";
import { BookOpen, Clock3, Heart, Plus, Sparkles, Trash2 } from "lucide-react";
import { ApiError, createWishlistItem, deleteWishlistItem, getWishlistItems } from "../api/client";
import { Alert } from "../components/ui/alert";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Select } from "../components/ui/select";
import { useBooksContext } from "../context/BooksContext";
import type { WishlistItem, WishlistPriority } from "../types/wishlist";
import { capitalizeFirst, capitalizeWords } from "../utils/textCase";

type WishlistSort = "prioridad" | "reciente" | "titulo";

/** Solo para migrar datos antiguos de localStorage a la API una vez. */
const WISHLIST_STORAGE_KEY = "readtracker-wishlist-items";

const getPriorityLabel = (priority: WishlistPriority) => {
  if (priority >= 5) return "Alta";
  if (priority <= 1) return "Baja";
  return "Media";
};

export const WishlistPage = () => {
  const { books } = useBooksContext();
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("todos");
  const [sortBy, setSortBy] = useState<WishlistSort>("prioridad");
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newAuthor, setNewAuthor] = useState("");
  const [newGenre, setNewGenre] = useState("");
  const [newPriority, setNewPriority] = useState<WishlistPriority>(3);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [savingWish, setSavingWish] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
    const load = async () => {
      setLoading(true);
      setLoadError(null);
      try {
        let list = await getWishlistItems();
        if (list.length === 0) {
          const raw = localStorage.getItem(WISHLIST_STORAGE_KEY);
          if (raw) {
            try {
              const parsed = JSON.parse(raw) as unknown[];
              if (Array.isArray(parsed) && parsed.length > 0) {
                for (const row of parsed) {
                  if (!row || typeof row !== "object") continue;
                  const o = row as Record<string, unknown>;
                  const title = typeof o.title === "string" ? o.title.trim() : "";
                  const author = typeof o.author === "string" ? o.author.trim() : "";
                  if (!title || !author) continue;
                  const genre = typeof o.genre === "string" ? o.genre.trim() : undefined;
                  const pr = o.priority;
                  const priority =
                    typeof pr === "number" && pr >= 1 && pr <= 5 ? (pr as WishlistPriority) : undefined;
                  await createWishlistItem({ title, author, genre: genre || undefined, priority });
                }
                localStorage.removeItem(WISHLIST_STORAGE_KEY);
                list = await getWishlistItems();
              }
            } catch {
              // JSON inválido: se ignora
            }
          }
        }
        setItems(list);
      } catch (err) {
        setLoadError(err instanceof ApiError ? err.message : "No se pudo cargar la lista de deseos");
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const nowReading = useMemo(() => books.find((book) => book.status === "leyendo"), [books]);
  const readCount = useMemo(() => books.filter((book) => book.status === "leido").length, [books]);
  const averageRating = useMemo(() => {
    const rated = books.filter(
      (book) => book.status === "leido" && typeof book.rating === "number" && (book.rating ?? 0) > 0
    );
    if (rated.length === 0) return "0.0";
    const total = rated.reduce((acc, item) => acc + (item.rating ?? 0), 0);
    return (total / rated.length).toFixed(1);
  }, [books]);

  const genres = useMemo(() => {
    const counts = new Map<string, number>();
    items.forEach((item) => {
      const normalized = item.genre.trim();
      if (!normalized) return;
      counts.set(normalized, (counts.get(normalized) ?? 0) + 1);
    });
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "es"));
  }, [items]);

  const visibleItems = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    const filtered = items.filter((item) => {
      const matchesSearch =
        !normalized ||
        item.title.toLowerCase().includes(normalized) ||
        item.author.toLowerCase().includes(normalized) ||
        item.genre.toLowerCase().includes(normalized);
      const matchesGenre =
        genre === "todos" || item.genre.localeCompare(genre, "es", { sensitivity: "base" }) === 0;
      return matchesSearch && matchesGenre;
    });

    return filtered.toSorted((a, b) => {
      if (sortBy === "titulo") return a.title.localeCompare(b.title, "es", { sensitivity: "base" });
      if (sortBy === "reciente") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return b.priority - a.priority || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [genre, items, search, sortBy]);

  const addWish = async () => {
    if (!newTitle.trim() || !newAuthor.trim()) return;
    const title = capitalizeFirst(newTitle.trim());
    const author = capitalizeWords(newAuthor.trim());
    const genre = capitalizeFirst(newGenre.trim()) || "General";
    setSavingWish(true);
    setLoadError(null);
    try {
      const created = await createWishlistItem({
        title,
        author,
        genre,
        priority: newPriority
      });
      setItems((prev) => [created, ...prev]);
      setNewTitle("");
      setNewAuthor("");
      setNewGenre("");
      setNewPriority(3);
      setIsAddOpen(false);
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : "No se pudo guardar el deseo");
    } finally {
      setSavingWish(false);
    }
  };

  const removeWish = async (id: string) => {
    setDeletingId(id);
    setLoadError(null);
    try {
      await deleteWishlistItem(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : "No se pudo eliminar el deseo");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="min-h-full space-y-6 bg-transparent pl-1 pr-4 py-2 text-amber-50 sm:pl-2 sm:pr-6">
      <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
        <aside className="space-y-4">
          <div className="rounded-md border border-amber-700/60 bg-[#e9dcc4] p-4 text-[#4d311d]">
            <p className="mb-3 text-xs font-semibold tracking-[0.18em] text-[#7a573c]">MI BIBLIOTECA</p>
            <div className="mb-3 border-t border-[#c4a27b]/70" />
            <div className="grid grid-cols-2 gap-3 text-center">
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
                <p className="font-['Fraunces',serif] text-3xl">{items.length}</p>
                <p className="text-[11px] uppercase tracking-[0.12em]">Deseos</p>
              </div>
            </div>
          </div>

          <div className="rounded-md border border-amber-700/60 bg-[#e9dcc4] p-4 text-[#4d311d]">
            <p className="mb-2 text-xs font-semibold tracking-[0.18em] text-[#7a573c]">LEYENDO AHORA</p>
            <div className="mb-3 border-t border-[#c4a27b]/70" />
            {nowReading ? (
              <div className="space-y-1">
                <p className="text-xs italic text-[#7a573c]">Lectura actual</p>
                <p className="font-['Fraunces',serif] text-lg leading-tight">{nowReading.title}</p>
                <p className="text-sm">{nowReading.author}</p>
                <p className="text-xs">Avance: {nowReading.progress ?? 0}%</p>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[#d9c7ad]">
                  <div
                    className="h-full rounded-full bg-[#8e633d]"
                    style={{ width: `${Math.max(0, Math.min(100, nowReading.progress ?? 0))}%` }}
                  />
                </div>
              </div>
            ) : (
              <p className="text-sm">No hay lectura activa ahora mismo.</p>
            )}
          </div>

          <div className="rounded-md border border-amber-700/60 bg-[#e9dcc4] p-4 text-[#4d311d]">
            <p className="mb-2 text-xs font-semibold tracking-[0.18em] text-[#7a573c]">ESTANTES</p>
            <div className="mb-3 border-t border-[#c4a27b]/70" />
            <ul className="space-y-2 text-sm">
              <li className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2"><BookOpen className="h-3.5 w-3.5" />Todos</span>
                <span>{books.length}</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2"><Clock3 className="h-3.5 w-3.5" />Leídos</span>
                <span>{readCount}</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2"><Heart className="h-3.5 w-3.5" />Favoritos</span>
                <span>{books.filter((b) => b.isFavorite).length}</span>
              </li>
            </ul>
          </div>
        </aside>

        <div className="space-y-4">
          {loadError && (
            <Alert variant="destructive" className="border-amber-800/80 bg-[#3a0f0f]/90 text-amber-50">
              {loadError}
            </Alert>
          )}
          <div className="rounded-md border border-amber-700/60 bg-[#e9dcc4] p-3">
            <div className="grid gap-2 sm:grid-cols-[1fr_170px_170px_auto]">
              <Input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar en lista de deseos..."
                className="border-[#b08a63] bg-[#f8f1e5] text-[#4d311d] placeholder:text-[#8d6d4d]"
              />
              <Select
                value={genre}
                onChange={(event) => setGenre(event.target.value)}
                className="!border-[#8e633d] !bg-[#8e633d] !text-[#f8f1e5] hover:!bg-[#7c5534] dark:!border-[#8e633d] dark:!bg-[#8e633d] dark:!text-[#f8f1e5]"
              >
                <option value="todos">Todos los géneros</option>
                {genres.map(([name]) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </Select>
              <Select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as WishlistSort)}
                className="!border-[#8e633d] !bg-[#8e633d] !text-[#f8f1e5] hover:!bg-[#7c5534] dark:!border-[#8e633d] dark:!bg-[#8e633d] dark:!text-[#f8f1e5]"
              >
                <option value="prioridad">Ordenar: Prioridad</option>
                <option value="reciente">Ordenar: Reciente</option>
                <option value="titulo">Ordenar: Título</option>
              </Select>
              <Button
                size="default"
                className="h-8 border border-[#8e633d] bg-[#8e633d] px-4 font-semibold text-[#f8f1e5] hover:bg-[#7c5534]"
                onClick={() => setIsAddOpen(true)}
              >
                <Plus className="mr-1 h-3.5 w-3.5" />
                Añadir deseo
              </Button>
            </div>
          </div>

          <div className="border-t border-amber-700/60 pt-4">
            <div className="mb-4 flex items-center justify-between gap-2">
              <p className="font-['Fraunces',serif] text-2xl text-[#5a2f1f] dark:text-amber-100">✦ Lista de deseos</p>
              <span className="text-xs text-[#8e633d] dark:text-amber-200/80">{visibleItems.length} libros por comprar</span>
            </div>
            {loading ? (
              <p className="text-sm text-amber-100/90">Cargando lista de deseos...</p>
            ) : visibleItems.length === 0 ? (
              <Alert className="border-amber-700/60 bg-[#e9dcc4] text-[#4d311d]">
                Tu lista de deseos está vacía. Añade libros que quieras comprar.
              </Alert>
            ) : (
              <section className="grid items-start gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                {visibleItems.map((item) => (
                  <article key={item.id} className="overflow-hidden border border-[#8f643f] bg-[#f2e6d3] text-[#4d311d]">
                    <div className="space-y-1 border-b border-[#8f643f] px-2.5 py-2">
                      <span className="inline-flex border border-[#c89c33]/70 bg-[#2d130b]/60 px-1.5 py-0.5 text-[9px] uppercase tracking-[0.09em] text-[#d7b06f]">
                        {getPriorityLabel(item.priority)}
                      </span>
                      <p className="line-clamp-1 font-['Fraunces',serif] text-[1.04rem]">{item.title}</p>
                      <p className="line-clamp-1 text-xs italic text-[#7a573c]">{item.author}</p>
                    </div>
                    <div className="space-y-1 px-2.5 py-2">
                      <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.1em] text-[#7a573c]">
                        <span className="line-clamp-1">{item.genre}</span>
                        <span>{new Date(item.createdAt).getFullYear()}</span>
                      </div>
                      <div className="pt-1">
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => void removeWish(item.id)}
                          disabled={deletingId === item.id}
                          className="h-6 rounded-none border border-[#8e633d] bg-[#8e633d] px-2 text-[10px] uppercase tracking-[0.08em] text-[#f8f1e5] hover:bg-[#7c5534]"
                        >
                          <Sparkles className="mr-1 h-3 w-3" />
                          Comprado
                        </Button>
                      </div>
                    </div>
                  </article>
                ))}
              </section>
            )}
          </div>
        </div>
      </div>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="border border-[#8f643f] bg-[#f2e6d3] text-[#4d311d] shadow-xl">
          <DialogHeader>
            <DialogTitle className="font-['Fraunces',serif] text-2xl text-[#5a2f1f]">Añadir deseo</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              value={newTitle}
              onChange={(event) => setNewTitle(capitalizeFirst(event.target.value))}
              placeholder="Título"
              className="border-[#b08a63] bg-[#f8f1e5] text-[#4d311d]"
            />
            <Input
              value={newAuthor}
              onChange={(event) => setNewAuthor(capitalizeWords(event.target.value))}
              placeholder="Autor"
              className="border-[#b08a63] bg-[#f8f1e5] text-[#4d311d]"
            />
            <Input
              value={newGenre}
              onChange={(event) => setNewGenre(capitalizeFirst(event.target.value))}
              placeholder="Género"
              className="border-[#b08a63] bg-[#f8f1e5] text-[#4d311d]"
            />
            <Select
              value={String(newPriority)}
              onChange={(event) => setNewPriority(Number(event.target.value) as WishlistPriority)}
              className="!border-[#8e633d] !bg-[#8e633d] !text-[#f8f1e5] hover:!bg-[#7c5534] dark:!border-[#8e633d] dark:!bg-[#8e633d] dark:!text-[#f8f1e5]"
            >
              <option value="5">Prioridad alta</option>
              <option value="3">Prioridad media</option>
              <option value="1">Prioridad baja</option>
            </Select>
          </div>
          <DialogFooter className="!mx-0 !mb-0 border-[#c4a27b]/70 bg-[#eadcc4]">
            <Button variant="outline" onClick={() => setIsAddOpen(false)} className="border-[#b08a63] bg-[#efe4d1] text-[#6f4b2e] hover:border-[#8e633d] hover:bg-[#e2cfb2] hover:text-[#5a3d24]">
              Cancelar
            </Button>
            <Button
              onClick={() => void addWish()}
              disabled={savingWish}
              className="border border-[#8e633d] bg-[#8e633d] text-[#f8f1e5] hover:bg-[#7c5534]"
            >
              <Trash2 className="mr-1 h-3.5 w-3.5" />
              {savingWish ? "Guardando..." : "Guardar deseo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
};
