// Funciones tipadas de red para operaciones CRUD del recurso libros.
import { Book, CreateBookDto, UpdateBookDto } from "../types/book";
import { apiFetch } from "./client";

interface ApiResponse<T> {
  data: T;
}

export const getBooks = async (search?: string, status?: string): Promise<Book[]> => {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (status) params.set("status", status);
  const query = params.toString() ? `?${params.toString()}` : "";
  const response = await apiFetch<ApiResponse<Book[]>>(`/books${query}`);
  return response.data;
};

export const getBookById = async (id: string): Promise<Book> => {
  const response = await apiFetch<ApiResponse<Book>>(`/books/${id}`);
  return response.data;
};

export const createBook = async (data: CreateBookDto): Promise<Book> => {
  const response = await apiFetch<ApiResponse<Book>>("/books", {
    method: "POST",
    body: JSON.stringify(data)
  });
  return response.data;
};

export const updateBook = async (id: string, data: UpdateBookDto): Promise<Book> => {
  const response = await apiFetch<ApiResponse<Book>>(`/books/${id}`, {
    method: "PUT",
    body: JSON.stringify(data)
  });
  return response.data;
};

export const deleteBook = async (id: string): Promise<{ id: string }> => {
  const response = await apiFetch<ApiResponse<{ id: string }>>(`/books/${id}`, {
    method: "DELETE"
  });
  return response.data;
};
