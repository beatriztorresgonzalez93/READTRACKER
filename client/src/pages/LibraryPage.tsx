// Página principal con listado, búsqueda y filtros de la biblioteca.
import { useState } from "react";
import { Link } from "react-router-dom";
import { deleteBook } from "../api/client";
import { BookList } from "../components/BookList";
import { Alert } from "../components/ui/alert";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Select } from "../components/ui/select";
import { useBooksContext } from "../context/BooksContext";
import { useBookFilters } from "../hooks/useBookFilters";

export const LibraryPage = () => {
  const { books, loading, error, reloadBooks } = useBooksContext();
  const { search, setSearch, status, setStatus, sortBy, setSortBy, filteredBooks } = useBookFilters(books);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDeleteBook = async (id: string) => {
    try {
      setDeleteError(null);
      setDeletingId(id);
      await deleteBook(id);
      await reloadBooks();
    } catch {
      setDeleteError("No se pudo eliminar el libro. Inténtalo de nuevo.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="space-y-6">
      <Card className="bg-gradient-to-r from-white to-cyan-50/50 ring-1 ring-cyan-100 dark:from-slate-900 dark:to-cyan-950/20 dark:ring-cyan-900/40">
        <CardHeader className="pb-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="rt-kicker text-slate-500 dark:text-slate-400">Panel de lectura</p>
              <h1 className="rt-page-title text-3xl text-slate-900 dark:text-slate-100">Mi biblioteca</h1>
            </div>
            <Link to="/books/new">
              <Button size="default">Añadir libro</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-[1fr_220px_220px]">
            <Input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por título, autor o género..."
            />
            <Select value={status} onChange={(event) => setStatus(event.target.value as typeof status)}>
              <option value="todos">Todos</option>
              <option value="pendiente">Pendiente</option>
              <option value="leyendo">Leyendo</option>
              <option value="leido">Leído</option>
            </Select>
            <Select value={sortBy} onChange={(event) => setSortBy(event.target.value as typeof sortBy)}>
              <option value="recientes">Más recientes</option>
              <option value="titulo">Título (A-Z)</option>
              <option value="autor">Autor (A-Z)</option>
              <option value="genero">Género (A-Z)</option>
              <option value="valoracion">Valoración (alta-baja)</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      {deleteError && (
        <Alert variant="destructive" className="flex flex-wrap items-center justify-between gap-3">
          <span>{deleteError}</span>
          <Button variant="outline" size="sm" onClick={() => setDeleteError(null)} className="shrink-0">
            Cerrar
          </Button>
        </Alert>
      )}

      {loading && <p className="rt-body-copy text-slate-600 dark:text-slate-300">Cargando libros...</p>}
      {error && <Alert variant="destructive">{error}</Alert>}
      {!loading && !error && (
        <BookList books={filteredBooks} deletingId={deletingId} onDelete={handleDeleteBook} />
      )}
    </section>
  );
};
