// Cliente HTTP base reutilizable para llamadas a la API con manejo de errores.
import { Book, CreateBookDto, UpdateBookDto } from "../types/book";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000/api/v1";
const AUTH_TOKEN_KEY = "readtracker-auth-token";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface AuthResult {
  token: string;
  user: AuthUser;
}

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
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
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

export const authStorage = {
  getToken: () => localStorage.getItem(AUTH_TOKEN_KEY),
  setToken: (token: string) => localStorage.setItem(AUTH_TOKEN_KEY, token),
  clearToken: () => localStorage.removeItem(AUTH_TOKEN_KEY)
};

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

export const registerUser = async (name: string, email: string, password: string): Promise<AuthResult> => {
  const response = await apiFetch<ApiResponse<AuthResult>>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password })
  });
  return response.data;
};

export const loginUser = async (email: string, password: string): Promise<AuthResult> => {
  const response = await apiFetch<ApiResponse<AuthResult>>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password })
  });
  return response.data;
};

export const getMe = async (): Promise<AuthUser> => {
  const response = await apiFetch<ApiResponse<AuthUser>>("/auth/me");
  return response.data;
};
