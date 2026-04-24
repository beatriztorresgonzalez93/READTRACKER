// Tipos de sesiones de lectura usados por cliente API, hook y vistas de historial.
export interface ReadingSession {
  id: string;
  userId: string;
  bookId: string;
  title: string;
  author: string;
  previousPage?: number;
  currentPage: number;
  pagesRead: number;
  recordedAt: string;
  createdAt: string;
}

export interface CreateReadingSessionDto {
  bookId: string;
  previousPage?: number;
  currentPage: number;
  recordedAt?: string;
}
