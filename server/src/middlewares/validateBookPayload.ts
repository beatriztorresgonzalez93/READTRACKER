// Validaciones básicas de payload para crear y actualizar libros.
import { Request, Response, NextFunction } from "express";
import { ReadingStatus } from "../types/book";

const validStatuses: ReadingStatus[] = ["pendiente", "leyendo", "leido"];

const isValidStatus = (status: unknown): status is ReadingStatus =>
  typeof status === "string" && validStatuses.includes(status as ReadingStatus);

const updateBookKeys = [
  "title",
  "author",
  "publisher",
  "genre",
  "publicationYear",
  "status",
  "rating",
  "review",
  "progress",
  "coverUrl"
] as const;

export const validateCreateBook = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { title, author, publisher, genre, publicationYear, status, rating, progress } = req.body;

  if (!title || !author || !publisher || !genre || !isValidStatus(status)) {
    res.status(400).json({ error: "Título, autor, editorial, género y estado son obligatorios" });
    return;
  }

  if (rating !== undefined && (rating < 0 || rating > 5)) {
    res.status(400).json({ error: "La calificación debe estar entre 0 y 5" });
    return;
  }

  if (progress !== undefined && (progress < 0 || progress > 100)) {
    res.status(400).json({ error: "El progreso debe estar entre 0 y 100" });
    return;
  }

  if (
    publicationYear !== undefined &&
    (typeof publicationYear !== "number" || publicationYear < 0 || publicationYear > 3000)
  ) {
    res.status(400).json({ error: "El año de publicación no es válido" });
    return;
  }

  next();
};

export const validateUpdateBook = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const body = req.body;

  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    res.status(400).json({ error: "El cuerpo debe ser un objeto JSON" });
    return;
  }

  const keys = Object.keys(body as Record<string, unknown>);
  const unknown = keys.filter((k) => !updateBookKeys.includes(k as (typeof updateBookKeys)[number]));
  if (unknown.length > 0) {
    res.status(400).json({ error: `Campos no permitidos: ${unknown.join(", ")}` });
    return;
  }

  const allowedPresent = updateBookKeys.filter((k) =>
    Object.prototype.hasOwnProperty.call(body, k)
  );
  if (allowedPresent.length === 0) {
    res.status(400).json({ error: "Debes enviar al menos un campo para actualizar" });
    return;
  }

  const { status, rating, progress, publicationYear, publisher } = body as Record<string, unknown>;

  if (status !== undefined && !isValidStatus(status)) {
    res.status(400).json({ error: "El estado no es válido" });
    return;
  }

  if (rating !== undefined) {
    if (typeof rating !== "number" || rating < 0 || rating > 5) {
      res.status(400).json({ error: "La calificación debe estar entre 0 y 5" });
      return;
    }
  }

  if (progress !== undefined) {
    if (typeof progress !== "number" || progress < 0 || progress > 100) {
      res.status(400).json({ error: "El progreso debe estar entre 0 y 100" });
      return;
    }
  }

  if (publicationYear !== undefined) {
    if (
      typeof publicationYear !== "number" ||
      publicationYear < 0 ||
      publicationYear > 3000
    ) {
      res.status(400).json({ error: "El año de publicación no es válido" });
      return;
    }
  }

  if (publisher !== undefined && (typeof publisher !== "string" || !publisher.trim())) {
    res.status(400).json({ error: "La editorial no es válida" });
    return;
  }

  next();
};
