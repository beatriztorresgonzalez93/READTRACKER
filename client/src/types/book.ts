// Tipos del dominio Book usados en formularios, API y componentes del frontend.
export type ReadingStatus = "pendiente" | "leyendo" | "leido";

export interface Book {
  id: string;
  title: string;
  author: string;
  publisher: string;
  genre: string;
  pages?: number;
  publicationYear?: number;
  status: ReadingStatus;
  rating?: number;
  review?: string;
  synopsis?: string;
  reviewTags?: string[];
  readAt?: string;
  timesRead?: string;
  favoriteQuote?: string;
  wouldRecommend?: "si" | "depende" | "no";
  progress?: number;
  currentPage?: number;
  lastPageMarkedAt?: string;
  coverUrl?: string;
  isFavorite?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookDto {
  title: string;
  author: string;
  publisher: string;
  genre: string;
  pages?: number;
  publicationYear?: number;
  status: ReadingStatus;
  rating?: number;
  review?: string;
  synopsis?: string;
  reviewTags?: string[];
  readAt?: string;
  timesRead?: string;
  favoriteQuote?: string;
  wouldRecommend?: "si" | "depende" | "no";
  progress?: number;
  currentPage?: number;
  lastPageMarkedAt?: string;
  coverUrl?: string;
  isFavorite?: boolean;
}

export interface UpdateBookDto extends Partial<CreateBookDto> {}
