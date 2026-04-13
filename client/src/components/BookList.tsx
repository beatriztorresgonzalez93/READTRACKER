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
    <section className="relative isolate overflow-hidden rounded-2xl px-1">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 bg-[repeating-linear-gradient(to_bottom,transparent_0px,transparent_447px,#8a5a36_447px,#6f4527_448px,#5a3316_448px,#613a1a_454px,#4f2d13_460px,#643b1b_466px,#573115_472px,#3d2410_472px,#32200f_492px,transparent_492px,transparent_542px)]"
      />
      <div className="relative z-10 grid items-end justify-items-center gap-x-4 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {books.map((book, index) => (
          <div
            key={book.id}
            className="flex w-full max-w-xs justify-center pb-6"
          >
            <BookCard
              book={book}
              index={index}
              isDeleting={deletingId === book.id}
              onDelete={onDelete}
            />
          </div>
        ))}
      </div>
    </section>
  );
};
