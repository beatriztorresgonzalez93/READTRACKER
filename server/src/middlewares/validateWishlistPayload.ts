// Validación del cuerpo al crear un ítem de lista de deseos.
import { NextFunction, Request, Response } from "express";
import { WishlistPriority } from "../types/wishlist";

const validPriorities = new Set<WishlistPriority>([1, 2, 3, 4, 5]);

export const validateCreateWishlistItem = (req: Request, res: Response, next: NextFunction) => {
  const { title, author, genre, priority } = req.body;

  if (!title || typeof title !== "string" || !title.trim()) {
    res.status(400).json({ error: "El título es obligatorio" });
    return;
  }
  if (!author || typeof author !== "string" || !author.trim()) {
    res.status(400).json({ error: "El autor es obligatorio" });
    return;
  }
  if (genre !== undefined && genre !== null && typeof genre !== "string") {
    res.status(400).json({ error: "El género no es válido" });
    return;
  }
  if (priority !== undefined && priority !== null) {
    if (typeof priority !== "number" || !Number.isInteger(priority) || !validPriorities.has(priority as WishlistPriority)) {
      res.status(400).json({ error: "La prioridad debe ser un entero entre 1 y 5" });
      return;
    }
  }

  next();
};
