// Tipos compartidos entre componentes y utilidades de la vista de historial.
import { Book } from "../../types/book";

export type HistoryEvent = {
  id: string;
  bookId: string;
  title: string;
  author: string;
  at: Date;
  dayKey: string;
  page: number;
  previousPage: number | null;
  pagesRead: number | null;
};

export type BookSummary = {
  title: string;
  pages: number;
  sessions: number;
};

export type IntensityLegendItem = [string, number, string];

export type BooksByIdMap = Map<string, Book>;
