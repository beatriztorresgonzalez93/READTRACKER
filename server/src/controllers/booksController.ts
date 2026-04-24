// Capa HTTP: recibe req/res, llama al servicio y devuelve respuestas JSON.
import { Request, Response } from "express";
import { logError } from "../logger";
import { BooksService } from "../services/booksService";
import { sendApiError } from "../utils/apiResponse";

export class BooksController {
  constructor(private readonly service: BooksService) {}

  private getSingleQueryValue(value: unknown): string | undefined {
    return typeof value === "string" ? value : undefined;
  }

  private getSingleParamValue(value: unknown): string | null {
    return typeof value === "string" ? value : null;
  }

  getBooks = async (req: Request, res: Response) => {
    const userId = res.locals.userId as string | undefined;
    if (!userId) {
      sendApiError(res, 401, "AUTH_REQUIRED", "No autorizado");
      return;
    }
    try {
      const search = this.getSingleQueryValue(req.query.search);
      const status = this.getSingleQueryValue(req.query.status);
      const books = await this.service.getBooks(userId, search, status);
      res.status(200).json({ data: books });
    } catch (err) {
      logError("BooksController.getBooks", err);
      sendApiError(res, 500, "BOOKS_LIST_FAILED", "No se pudieron cargar los libros");
    }
  };

  getBookById = async (req: Request, res: Response) => {
    const userId = res.locals.userId as string | undefined;
    if (!userId) {
      sendApiError(res, 401, "AUTH_REQUIRED", "No autorizado");
      return;
    }
    const id = this.getSingleParamValue(req.params.id);
    if (!id) {
      sendApiError(res, 400, "INVALID_BOOK_ID", "El id del libro no es válido");
      return;
    }

    try {
      const book = await this.service.getBookById(id, userId);
      if (!book) {
        sendApiError(res, 404, "BOOK_NOT_FOUND", "Libro no encontrado");
        return;
      }
      res.status(200).json({ data: book });
    } catch (err) {
      logError("BooksController.getBookById", err);
      sendApiError(res, 500, "BOOK_LOAD_FAILED", "No se pudo cargar el libro");
    }
  };

  createBook = async (req: Request, res: Response) => {
    const userId = res.locals.userId as string | undefined;
    if (!userId) {
      sendApiError(res, 401, "AUTH_REQUIRED", "No autorizado");
      return;
    }
    try {
      const book = await this.service.createBook(req.body, userId);
      res.status(201).json({ data: book });
    } catch (err) {
      logError("BooksController.createBook", err);
      sendApiError(res, 500, "BOOK_CREATE_FAILED", "No se pudo crear el libro");
    }
  };

  updateBook = async (req: Request, res: Response) => {
    const userId = res.locals.userId as string | undefined;
    if (!userId) {
      sendApiError(res, 401, "AUTH_REQUIRED", "No autorizado");
      return;
    }
    const id = this.getSingleParamValue(req.params.id);
    if (!id) {
      sendApiError(res, 400, "INVALID_BOOK_ID", "El id del libro no es válido");
      return;
    }

    try {
      const updated = await this.service.updateBook(id, req.body, userId);
      if (!updated) {
        sendApiError(res, 404, "BOOK_NOT_FOUND", "Libro no encontrado");
        return;
      }
      res.status(200).json({ data: updated });
    } catch (err) {
      logError("BooksController.updateBook", err);
      sendApiError(res, 500, "BOOK_UPDATE_FAILED", "No se pudo actualizar el libro");
    }
  };

  deleteBook = async (req: Request, res: Response) => {
    const userId = res.locals.userId as string | undefined;
    if (!userId) {
      sendApiError(res, 401, "AUTH_REQUIRED", "No autorizado");
      return;
    }
    const id = this.getSingleParamValue(req.params.id);
    if (!id) {
      sendApiError(res, 400, "INVALID_BOOK_ID", "El id del libro no es válido");
      return;
    }

    try {
      const deleted = await this.service.deleteBook(id, userId);
      if (!deleted) {
        sendApiError(res, 404, "BOOK_NOT_FOUND", "Libro no encontrado");
        return;
      }
      res.status(200).json({ data: { id } });
    } catch (err) {
      logError("BooksController.deleteBook", err);
      sendApiError(res, 500, "BOOK_DELETE_FAILED", "No se pudo eliminar el libro");
    }
  };
}
