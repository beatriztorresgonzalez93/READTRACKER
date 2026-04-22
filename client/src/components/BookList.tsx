// Lista de libros que renderiza cards y maneja estado vacío.
import { Book } from "../types/book";
import { BookCard } from "./BookCard";

interface BookListProps {
  books: Book[];
  onOpenPreview?: (id: string) => void;
}

export const BookList = ({ books, onOpenPreview }: BookListProps) => {
  if (books.length === 0) {
    return (
      <p className="text-sm text-amber-100/90">No hay libros para mostrar.</p>
    );
  }

  return (
    <section className="grid items-start justify-items-start gap-x-2 gap-y-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {books.map((book, index) => (
        <BookCard
          key={book.id}
          book={book}
          index={index}
          onOpenPreview={onOpenPreview}
        />
      ))}
    </section>
  );
};
