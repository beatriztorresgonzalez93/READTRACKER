// Cliente HTTP base reutilizable para llamadas a la API con manejo de errores.
import { Book, CreateBookDto, UpdateBookDto } from "../types/book";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000/api/v1";

interface ApiErrorBody {
  error?: string;
}

interface ApiResponse<T> {
  data: T;
}

export class ApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    },
    ...init
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => ({}))) as ApiErrorBody;
    throw new ApiError(errorBody.error ?? "No se pudo completar la petición", response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
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
