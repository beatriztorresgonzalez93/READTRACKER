// Cliente HTTP base reutilizable para llamadas a la API con manejo de errores.
import { Book, CreateBookDto, UpdateBookDto } from "../types/book";
import { CreateReadingSessionDto, ReadingSession } from "../types/readingSession";
import { WishlistAcquisition, WishlistItem } from "../types/wishlist";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000/api/v1";
const AUTH_TOKEN_KEY = "readtracker-auth-token";

export interface AuthUser {
  id: string;
  name: string;
  lastName: string;
  email: string;
  avatarUrl: string | null;
  createdAt: string;
}

export type UpdateProfileBody = {
  name?: string;
  lastName?: string;
  avatarUrl?: string | null;
};

export interface AuthResult {
  token: string;
  user: AuthUser;
}

interface ApiErrorBody {
  error?: string;
  message?: string;
  code?: string;
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

const getHttpErrorMessage = (status: number, serverMessage?: string) => {
  if (serverMessage?.trim()) return serverMessage;
  if (status === 400) return "Los datos enviados no son válidos. Revisa los campos e inténtalo de nuevo.";
  if (status === 401) return "Tu sesión ha caducado. Inicia sesión de nuevo.";
  if (status === 403) return "No tienes permisos para realizar esta acción.";
  if (status === 404) return "No se encontró el recurso solicitado.";
  if (status === 409) return "Se detectó un conflicto con los datos actuales. Recarga la página e inténtalo de nuevo.";
  if (status >= 500) return "Hay un problema temporal en el servidor. Inténtalo de nuevo en unos minutos.";
  return "No se pudo completar la petición.";
};

export const getReadableErrorMessage = (error: unknown, fallback = "Ha ocurrido un error inesperado.") => {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) {
    return "No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.";
  }
  return fallback;
};

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(init?.headers ?? {})
      },
      ...init
    });
  } catch {
    throw new ApiError(
      "No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.",
      0
    );
  }

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => ({}))) as ApiErrorBody;
    throw new ApiError(
      getHttpErrorMessage(response.status, errorBody.message ?? errorBody.error),
      response.status
    );
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

export const BOOKS_PAGE_SIZE = 12;

export interface BooksPageMeta {
  total: number;
  limit: number;
  offset: number;
}

export interface LibrarySummary {
  total: number;
  pendiente: number;
  leyendo: number;
  leido: number;
  favoritos: number;
  ratedSum: number;
  ratedCount: number;
  latestYear: number;
  genres: { genre: string; count: number }[];
}

export type BooksSortParam = "recientes" | "titulo" | "autor" | "genero" | "valoracion";

export interface GetBooksPageParams {
  search?: string;
  status?: string;
  shelf?: string;
  genre?: string | null;
  sort?: BooksSortParam;
  limit?: number;
  offset?: number;
}

export const getBooksPage = async (
  params: GetBooksPageParams
): Promise<{ data: Book[]; meta: BooksPageMeta }> => {
  const q = new URLSearchParams();
  if (params.search?.trim()) q.set("search", params.search.trim());
  q.set("status", params.status?.trim() || "todos");
  q.set("shelf", params.shelf?.trim() || "todos");
  if (params.genre?.trim()) q.set("genre", params.genre.trim());
  q.set("sort", params.sort ?? "recientes");
  q.set("limit", String(params.limit ?? BOOKS_PAGE_SIZE));
  q.set("offset", String(params.offset ?? 0));
  const raw = await apiFetch<{ data: Book[]; meta: BooksPageMeta }>(`/books?${q.toString()}`);
  return { data: raw.data, meta: raw.meta };
};

export const getBooksSummary = async (): Promise<LibrarySummary> => {
  const raw = await apiFetch<{ data: LibrarySummary }>("/books/summary");
  return raw.data;
};

/** Acumula todas las páginas (filtros neutros) para páginas que aún necesitan la colección completa. */
export const fetchAllBooksSnapshot = async (pageSize = 24): Promise<Book[]> => {
  const acc: Book[] = [];
  let offset = 0;
  while (true) {
    const { data, meta } = await getBooksPage({
      search: "",
      status: "todos",
      shelf: "todos",
      genre: null,
      sort: "recientes",
      limit: pageSize,
      offset
    });
    acc.push(...data);
    offset += data.length;
    if (data.length === 0 || acc.length >= meta.total) break;
  }
  return acc;
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

export const updateProfile = async (body: UpdateProfileBody): Promise<AuthUser> => {
  const response = await apiFetch<ApiResponse<AuthUser>>("/auth/me", {
    method: "PATCH",
    body: JSON.stringify(body)
  });
  return response.data;
};

export const getWishlistItems = async (): Promise<WishlistItem[]> => {
  const response = await apiFetch<ApiResponse<WishlistItem[]>>("/wishlist");
  return response.data;
};

export const getWishlistAcquisitions = async (): Promise<WishlistAcquisition[]> => {
  const response = await apiFetch<ApiResponse<WishlistAcquisition[]>>("/wishlist/acquisitions");
  return response.data;
};

export const createWishlistItem = async (body: {
  title: string;
  author: string;
  price?: string;
  store?: string;
  priority?: number;
}): Promise<WishlistItem> => {
  const response = await apiFetch<ApiResponse<WishlistItem>>("/wishlist", {
    method: "POST",
    body: JSON.stringify(body)
  });
  return response.data;
};

export const updateWishlistItem = async (
  id: string,
  body: {
    title: string;
    author: string;
    price?: string;
    store?: string;
    priority?: number;
  }
): Promise<WishlistItem> => {
  const response = await apiFetch<ApiResponse<WishlistItem>>(`/wishlist/${id}`, {
    method: "PUT",
    body: JSON.stringify(body)
  });
  return response.data;
};

export const deleteWishlistItem = async (id: string): Promise<void> => {
  await apiFetch<ApiResponse<{ id: string }>>(`/wishlist/${id}`, {
    method: "DELETE"
  });
};

export const purchaseWishlistItem = async (id: string): Promise<WishlistAcquisition> => {
  const response = await apiFetch<ApiResponse<WishlistAcquisition>>(`/wishlist/${id}/purchase`, {
    method: "POST"
  });
  return response.data;
};

export const getReadingSessions = async (): Promise<ReadingSession[]> => {
  const response = await apiFetch<ApiResponse<ReadingSession[]>>("/reading-sessions");
  return response.data;
};

export const createReadingSession = async (body: CreateReadingSessionDto): Promise<ReadingSession> => {
  const response = await apiFetch<ApiResponse<ReadingSession>>("/reading-sessions", {
    method: "POST",
    body: JSON.stringify(body)
  });
  return response.data;
};

export const deleteReadingSession = async (id: string): Promise<{ id: string }> => {
  const response = await apiFetch<ApiResponse<{ id: string }>>(`/reading-sessions/${id}`, {
    method: "DELETE"
  });
  return response.data;
};
