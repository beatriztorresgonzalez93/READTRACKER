// Capa HTTP: recibe req/res, llama al servicio y devuelve respuestas JSON.
import { Request, Response } from "express";
import { BooksService } from "../services/booksService";

export class BooksController {
  constructor(private readonly service: BooksService) {}

  private getSingleQueryValue(value: unknown): string | undefined {
    return typeof value === "string" ? value : undefined;
  }

  private getSingleParamValue(value: unknown): string | null {
    return typeof value === "string" ? value : null;
  }

  getBooks = async (req: Request, res: Response) => {
    try {
      const search = this.getSingleQueryValue(req.query.search);
      const status = this.getSingleQueryValue(req.query.status);
      const books = await this.service.getBooks(search, status);
      res.status(200).json({ data: books });
    } catch {
      res.status(500).json({ error: "No se pudieron cargar los libros" });
    }
  };

  getBookById = async (req: Request, res: Response) => {
    const id = this.getSingleParamValue(req.params.id);
    if (!id) {
      res.status(400).json({ error: "Invalid book id" });
      return;
    }

    try {
      const book = await this.service.getBookById(id);
      if (!book) {
        res.status(404).json({ error: "Book not found" });
        return;
      }
      res.status(200).json({ data: book });
    } catch {
      res.status(500).json({ error: "No se pudo cargar el libro" });
    }
  };

  createBook = async (req: Request, res: Response) => {
    try {
      const book = await this.service.createBook(req.body);
      res.status(201).json({ data: book });
    } catch {
      res.status(500).json({ error: "No se pudo crear el libro" });
    }
  };

  updateBook = async (req: Request, res: Response) => {
    const id = this.getSingleParamValue(req.params.id);
    if (!id) {
      res.status(400).json({ error: "Invalid book id" });
      return;
    }

    try {
      const updated = await this.service.updateBook(id, req.body);
      if (!updated) {
        res.status(404).json({ error: "Book not found" });
        return;
      }
      res.status(200).json({ data: updated });
    } catch {
      res.status(500).json({ error: "No se pudo actualizar el libro" });
    }
  };

  deleteBook = async (req: Request, res: Response) => {
    const id = this.getSingleParamValue(req.params.id);
    if (!id) {
      res.status(400).json({ error: "Invalid book id" });
      return;
    }

    try {
      const deleted = await this.service.deleteBook(id);
      if (!deleted) {
        res.status(404).json({ error: "Book not found" });
        return;
      }
      res.status(200).json({ data: { id } });
    } catch {
      res.status(500).json({ error: "No se pudo eliminar el libro" });
    }
  };
}
