// Lista de libros que renderiza cards y maneja estado vacío.
import { Book } from "../types/book";
import { BookCard } from "./BookCard";

interface BookListProps {
  books: Book[];
  onOpenPreview: (id: string) => void;
}

export const BookList = ({ books, onOpenPreview }: BookListProps) => {
  if (books.length === 0) {
    return (
      <p className="text-sm text-amber-100/90">No hay libros para mostrar.</p>
    );
  }

  return (
    <section className="grid w-full min-w-0 grid-cols-3 items-stretch justify-items-stretch gap-x-1.5 gap-y-3 sm:grid-cols-4 sm:gap-x-2 sm:gap-y-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
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
