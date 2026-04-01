// Tipos del dominio Book usados en formularios, API y componentes del frontend.
export type ReadingStatus = "pendiente" | "leyendo" | "leido";

export interface Book {
  id: string;
  title: string;
  author: string;
  genre: string;
  status: ReadingStatus;
  rating?: number;
  review?: string;
  progress?: number;
  coverUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookDto {
  title: string;
  author: string;
  genre: string;
  status: ReadingStatus;
  rating?: number;
  review?: string;
  progress?: number;
  coverUrl?: string;
}

export interface UpdateBookDto extends Partial<CreateBookDto> {}
