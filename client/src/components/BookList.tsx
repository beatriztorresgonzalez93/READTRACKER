// Lista de libros que renderiza cards y maneja estado vacío.
import { Book } from "../types/book";
import { BookCard } from "./BookCard";

interface BookListProps {
  books: Book[];
  deletingId: string | null;
  onDelete: (id: string) => void | Promise<void>;
}

export const BookList = ({ books, deletingId, onDelete }: BookListProps) => {
  if (books.length === 0) {
    return (
      <p className="text-sm text-slate-600 dark:text-slate-300">No hay libros para mostrar.</p>
    );
  }

  return (
    <section className="grid items-end justify-items-center gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {books.map((book, index) => (
        <BookCard
          key={book.id}
          book={book}
          index={index}
          isDeleting={deletingId === book.id}
          onDelete={onDelete}
        />
      ))}
    </section>
  );
};
