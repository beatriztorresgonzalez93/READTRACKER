// Capa de negocio: coordina operaciones de libros usando el repositorio.
import { BooksRepository } from "../repositories/booksRepository";
import { CreateBookDto, UpdateBookDto } from "../types/book";

export class BooksService {
  constructor(private readonly repository: BooksRepository) {}

  async getBooks(search?: string, status?: string) {
    return this.repository.findAll(search, status);
  }

  async getBookById(id: string) {
    return this.repository.findById(id);
  }

  async createBook(data: CreateBookDto) {
    return this.repository.create(data);
  }

  async updateBook(id: string, data: UpdateBookDto) {
    return this.repository.update(id, data);
  }

  async deleteBook(id: string) {
    return this.repository.delete(id);
  }
}
