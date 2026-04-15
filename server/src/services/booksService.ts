// Capa de negocio: coordina operaciones de libros usando el repositorio.
import { BooksRepository } from "../repositories/booksRepository";
import { CreateBookDto, UpdateBookDto } from "../types/book";

export class BooksService {
  constructor(private readonly repository: BooksRepository) {}

  async getBooks(userId: string, search?: string, status?: string) {
    return this.repository.findAll(userId, search, status);
  }

  async getBookById(id: string, userId: string) {
    return this.repository.findById(id, userId);
  }

  async createBook(data: CreateBookDto, userId: string) {
    return this.repository.create(data, userId);
  }

  async updateBook(id: string, data: UpdateBookDto, userId: string) {
    return this.repository.update(id, data, userId);
  }

  async deleteBook(id: string, userId: string) {
    return this.repository.delete(id, userId);
  }
}
