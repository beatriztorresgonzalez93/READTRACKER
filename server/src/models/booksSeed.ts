// Datos iniciales de ejemplo para arrancar la API con contenido.
import { Book } from "../types/book";

const now = new Date().toISOString();

export const booksSeed: Book[] = [
  {
    id: "1",
    title: "Clean Code",
    author: "Robert C. Martin",
    genre: "Software",
    status: "leyendo",
    rating: 5,
    review: "Muy practico para mejorar habitos de codigo.",
    progress: 35,
    coverUrl: "https://placehold.co/300x450?text=Clean+Code",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "2",
    title: "Atomic Habits",
    author: "James Clear",
    genre: "Productividad",
    status: "pendiente",
    progress: 0,
    coverUrl: "https://placehold.co/300x450?text=Atomic+Habits",
    createdAt: now,
    updatedAt: now
  }
];
