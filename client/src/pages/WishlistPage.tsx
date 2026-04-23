// Página de lista de deseos independiente de la biblioteca.
import { useEffect, useMemo, useState } from "react";
import { BookOpen, Bookmark, Clock3, Heart, Plus, Sparkles, Trash2 } from "lucide-react";
import { ApiError, createWishlistItem, getWishlistItems, purchaseWishlistItem, updateWishlistItem } from "../api/client";
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
  const [store, setStore] = useState("todos");
  const [sortBy, setSortBy] = useState<WishlistSort>("prioridad");
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newAuthor, setNewAuthor] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newStore, setNewStore] = useState("");
  const [newPriority, setNewPriority] = useState<WishlistPriority>(3);
  const [editingId, setEditingId] = useState<string | null>(null);
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
                  const price = typeof o.price === "string" ? o.price.trim() : undefined;
                  const store = typeof o.store === "string" ? o.store.trim() : undefined;
                  const pr = o.priority;
                  const priority =
                    typeof pr === "number" && pr >= 1 && pr <= 5 ? (pr as WishlistPriority) : undefined;
                  await createWishlistItem({ title, author, price: price || undefined, store: store || undefined, priority });
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

  const nowReadingBooks = useMemo(
    () =>
      books
        .filter((book) => book.status === "leyendo")
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
    [books]
  );
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
    books.forEach((book) => {
      const normalized = book.genre.trim();
      if (!normalized) return;
      counts.set(normalized, (counts.get(normalized) ?? 0) + 1);
    });
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "es"));
  }, [books]);

  const stores = useMemo(() => {
    const counts = new Map<string, number>();
    items.forEach((item) => {
      const normalized = item.store.trim();
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
        item.price.toLowerCase().includes(normalized) ||
        item.store.toLowerCase().includes(normalized);
      const matchesStore =
        store === "todos" || item.store.localeCompare(store, "es", { sensitivity: "base" }) === 0;
      return matchesSearch && matchesStore;
    });

    return filtered.toSorted((a, b) => {
      if (sortBy === "titulo") return a.title.localeCompare(b.title, "es", { sensitivity: "base" });
      if (sortBy === "reciente") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return b.priority - a.priority || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [store, items, search, sortBy]);

  const openCreateDialog = () => {
    setEditingId(null);
    setNewTitle("");
    setNewAuthor("");
    setNewPrice("");
    setNewStore("");
    setNewPriority(3);
    setIsAddOpen(true);
  };

  const openEditDialog = (item: WishlistItem) => {
    setEditingId(item.id);
    setNewTitle(item.title);
    setNewAuthor(item.author);
    setNewPrice(item.price ?? "");
    setNewStore(item.store ?? "");
    setNewPriority(item.priority);
    setIsAddOpen(true);
  };

  const saveWish = async () => {
    if (!newTitle.trim() || !newAuthor.trim()) return;
    const title = capitalizeFirst(newTitle.trim());
    const author = capitalizeWords(newAuthor.trim());
    const price = newPrice.trim() || "Sin precio";
    const store = capitalizeWords(newStore.trim()) || "Sin tienda";

    setSavingWish(true);
    setLoadError(null);
    try {
      if (editingId) {
        const updated = await updateWishlistItem(editingId, {
          title,
          author,
          price,
          store,
          priority: newPriority
        });
        setItems((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      } else {
        const created = await createWishlistItem({
          title,
          author,
          price,
          store,
          priority: newPriority
        });
        setItems((prev) => [created, ...prev]);
      }
      setEditingId(null);
      setNewTitle("");
      setNewAuthor("");
      setNewPrice("");
      setNewStore("");
      setNewPriority(3);
      setIsAddOpen(false);
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : editingId ? "No se pudo actualizar el deseo" : "No se pudo guardar el deseo");
    } finally {
      setSavingWish(false);
    }
  };

  const markWishAsPurchased = async (id: string) => {
    setDeletingId(id);
    setLoadError(null);
    try {
      await purchaseWishlistItem(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : "No se pudo marcar el deseo como comprado");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="min-h-full space-y-6 bg-transparent pl-1 pr-4 py-2 text-amber-50 sm:pl-2 sm:pr-6">
      <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
        <aside className="space-y-4">
          <div className="overflow-hidden rounded-xl border border-[#c69253] bg-[#e9dcc4] text-[#4d311d]">
            <p className="border-b border-[#c89c33] bg-[#1a0b06]/90 px-4 py-3 text-xs font-semibold tracking-[0.18em] text-[#e8cf9f]">📚 MI BIBLIOTECA</p>
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
                <p className="font-['Fraunces',serif] text-3xl">{items.length}</p>
                <p className="text-[11px] uppercase tracking-[0.12em]">Deseos</p>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-[#c69253] bg-[#e9dcc4] text-[#4d311d]">
            <p className="border-b border-[#c89c33] bg-[#1a0b06]/90 px-4 py-3 text-xs font-semibold tracking-[0.18em] text-[#e8cf9f]">📖 LEYENDO AHORA</p>
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
            <p className="border-b border-[#c89c33] bg-[#1a0b06]/90 px-4 py-3 text-xs font-semibold tracking-[0.18em] text-[#e8cf9f]">🗂️ ESTANTES</p>
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
            <p className="border-b border-[#c89c33] bg-[#1a0b06]/90 px-4 py-3 text-xs font-semibold tracking-[0.18em] text-[#e8cf9f]">🏷️ GÉNEROS</p>
            {genres.length === 0 ? (
              <p className="px-4 py-3 text-sm">Sin géneros todavía.</p>
            ) : (
              <ul className="divide-y divide-[#dcc8a7] text-sm">
                <li className="flex items-center justify-between px-4 py-2.5">
                  <span className="line-clamp-1">Todos</span>
                  <span className="font-semibold text-[#6f4b2e]">{books.length}</span>
                </li>
                {genres.map(([genre, count]) => (
                  <li key={genre} className="flex items-center justify-between px-4 py-2.5">
                    <span className="line-clamp-1">{genre}</span>
                    <span className="font-semibold text-[#6f4b2e]">{count}</span>
                  </li>
                ))}
              </ul>
            )}
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
                value={store}
                onChange={(event) => setStore(event.target.value)}
                className="!border-[#8e633d] !bg-[#8e633d] !text-[#f8f1e5] hover:!bg-[#7c5534] dark:!border-[#8e633d] dark:!bg-[#8e633d] dark:!text-[#f8f1e5]"
              >
                <option value="todos">Todas las tiendas</option>
                {stores.map(([name]) => (
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
                onClick={openCreateDialog}
              >
                <Plus className="mr-1 h-3.5 w-3.5" />
                Añadir deseo
              </Button>
            </div>
          </div>

          <div className="border-t border-[#d7b06f] pt-4">
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
                  <article
                    key={item.id}
                    className="cursor-pointer overflow-hidden border border-[#8f643f] bg-[#f2e6d3] text-[#4d311d] transition hover:shadow-[0_0_0_1px_#b6852f]"
                    onClick={() => openEditDialog(item)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        openEditDialog(item);
                      }
                    }}
                  >
                    <div className="space-y-1 border-b border-[#8f643f] px-2.5 py-2">
                      <span className="inline-flex border border-[#c89c33]/70 bg-[#2d130b]/60 px-1.5 py-0.5 text-[9px] uppercase tracking-[0.09em] text-[#d7b06f]">
                        {getPriorityLabel(item.priority)}
                      </span>
                      <p className="line-clamp-1 font-['Fraunces',serif] text-[1.04rem]">{item.title}</p>
                      <p className="line-clamp-1 text-xs italic text-[#7a573c]">{item.author}</p>
                    </div>
                    <div className="space-y-1 px-2.5 py-2">
                      <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.1em] text-[#7a573c]">
                        <span className="line-clamp-1">{item.store || "Sin tienda"}</span>
                        <span>{item.price || "Sin precio"}</span>
                      </div>
                      <div className="pt-1">
                        <Button
                          type="button"
                          size="sm"
                          onClick={(event) => {
                            event.stopPropagation();
                            void markWishAsPurchased(item.id);
                          }}
                          disabled={deletingId === item.id}
                          onMouseDown={(event) => event.stopPropagation()}
                          onKeyDown={(event) => event.stopPropagation()}
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

      <Dialog
        open={isAddOpen}
        onOpenChange={(open) => {
          setIsAddOpen(open);
          if (!open) setEditingId(null);
        }}
      >
        <DialogContent className="border border-[#8f643f] bg-[#f2e6d3] text-[#4d311d] shadow-xl">
          <DialogHeader>
            <DialogTitle className="font-['Fraunces',serif] text-2xl text-[#5a2f1f]">
              {editingId ? "Editar deseo" : "Añadir deseo"}
            </DialogTitle>
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
              value={newPrice}
              onChange={(event) => setNewPrice(event.target.value)}
              placeholder="Precio (ej: 19,90 EUR)"
              className="border-[#b08a63] bg-[#f8f1e5] text-[#4d311d]"
            />
            <Input
              value={newStore}
              onChange={(event) => setNewStore(capitalizeWords(event.target.value))}
              placeholder="Tienda (ej: Casa del Libro, Amazon...)"
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
              onClick={() => void saveWish()}
              disabled={savingWish}
              className="border border-[#8e633d] bg-[#8e633d] text-[#f8f1e5] hover:bg-[#7c5534]"
            >
              <Trash2 className="mr-1 h-3.5 w-3.5" />
              {savingWish ? "Guardando..." : editingId ? "Guardar cambios" : "Guardar deseo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
};
