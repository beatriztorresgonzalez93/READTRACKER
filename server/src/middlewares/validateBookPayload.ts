// Validaciones básicas de payload para crear y actualizar libros.
import { Request, Response, NextFunction } from "express";
import { ReadingStatus } from "../types/book";

const validStatuses: ReadingStatus[] = ["pendiente", "leyendo", "leido"];

const isValidStatus = (status: unknown): status is ReadingStatus =>
  typeof status === "string" && validStatuses.includes(status as ReadingStatus);

export const validateCreateBook = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { title, author, genre, status, rating, progress } = req.body;

  if (!title || !author || !genre || !isValidStatus(status)) {
    res.status(400).json({ error: "title, author, genre y status son requeridos" });
    return;
  }

  if (rating !== undefined && (rating < 0 || rating > 5)) {
    res.status(400).json({ error: "rating debe estar entre 0 y 5" });
    return;
  }

  if (progress !== undefined && (progress < 0 || progress > 100)) {
    res.status(400).json({ error: "progress debe estar entre 0 y 100" });
    return;
  }

  next();
};

export const validateUpdateBook = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { status, rating, progress } = req.body;

  if (status !== undefined && !isValidStatus(status)) {
    res.status(400).json({ error: "status invalido" });
    return;
  }

  if (rating !== undefined && (rating < 0 || rating > 5)) {
    res.status(400).json({ error: "rating debe estar entre 0 y 5" });
    return;
  }

  if (progress !== undefined && (progress < 0 || progress > 100)) {
    res.status(400).json({ error: "progress debe estar entre 0 y 100" });
    return;
  }

  next();
};
