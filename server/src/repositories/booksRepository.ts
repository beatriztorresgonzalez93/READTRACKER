// Capa de acceso a datos en PostgreSQL (Neon) para libros.
import { randomUUID } from "crypto";
import { pool } from "../config/db";
import { Book, CreateBookDto, UpdateBookDto } from "../types/book";

interface BookRow {
  id: string;
  title: string;
  author: string;
  publisher: string;
  genre: string;
  pages: number | null;
  publication_year: number | null;
  status: Book["status"];
  rating: number | null;
  review: string | null;
  review_tags: string[] | null;
  synopsis: string | null;
  read_at: string | null;
  times_read: string | null;
  favorite_quote: string | null;
  would_recommend: "si" | "depende" | "no" | null;
  progress: number | null;
  current_page: number | null;
  last_page_marked_at: Date | null;
  cover_url: string | null;
  is_favorite: boolean;
  created_at: Date;
  updated_at: Date;
}

const mapRow = (row: BookRow): Book => ({
  id: row.id,
  title: row.title,
  author: row.author,
  publisher: row.publisher,
  genre: row.genre,
  pages: row.pages ?? undefined,
  publicationYear: row.publication_year ?? undefined,
  status: row.status,
  rating: row.rating ?? undefined,
  review: row.review ?? undefined,
  reviewTags: row.review_tags ?? undefined,
  synopsis: row.synopsis ?? undefined,
  readAt: row.read_at ?? undefined,
  timesRead: row.times_read ?? undefined,
  favoriteQuote: row.favorite_quote ?? undefined,
  wouldRecommend: row.would_recommend ?? undefined,
  progress: row.progress ?? undefined,
  currentPage: row.current_page ?? undefined,
  lastPageMarkedAt: row.last_page_marked_at?.toISOString(),
  coverUrl: row.cover_url ?? undefined,
  isFavorite: row.is_favorite,
  createdAt: row.created_at.toISOString(),
  updatedAt: row.updated_at.toISOString()
});

export class BooksRepository {
  async findAll(userId: string, search?: string, status?: string): Promise<Book[]> {
    let sql = "SELECT * FROM books";
    const clauses: string[] = ["user_id = $1"];
    const values: unknown[] = [userId];
    let idx = 2;

    if (search) {
      clauses.push(`(title ILIKE $${idx} OR author ILIKE $${idx} OR publisher ILIKE $${idx} OR genre ILIKE $${idx})`);
      values.push(`%${search}%`);
      idx += 1;
    }

    if (status) {
      clauses.push(`status = $${idx}`);
      values.push(status);
      idx += 1;
    }

    sql += ` WHERE ${clauses.join(" AND ")}`;

    sql += " ORDER BY created_at DESC";

    const result = await pool.query<BookRow>(sql, values);
    return result.rows.map(mapRow);
  }

  async findById(id: string, userId: string): Promise<Book | undefined> {
    const result = await pool.query<BookRow>(
      "SELECT * FROM books WHERE id = $1 AND user_id = $2 LIMIT 1",
      [id, userId]
    );
    const row = result.rows[0];
    return row ? mapRow(row) : undefined;
  }

  async create(data: CreateBookDto, userId: string): Promise<Book> {
    const id = randomUUID();
    const result = await pool.query<BookRow>(
      `INSERT INTO books (id, user_id, title, author, publisher, genre, pages, publication_year, status, rating, review, review_tags, synopsis, read_at, times_read, favorite_quote, would_recommend, progress, current_page, last_page_marked_at, cover_url, is_favorite)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22)
       RETURNING *`,
      [
        id,
        userId,
        data.title,
        data.author,
        data.publisher,
        data.genre,
        data.pages ?? null,
        data.publicationYear ?? null,
        data.status,
        data.rating ?? null,
        data.review ?? null,
        data.reviewTags ?? [],
        data.synopsis ?? null,
        data.readAt ?? null,
        data.timesRead ?? null,
        data.favoriteQuote ?? null,
        data.wouldRecommend ?? null,
        data.progress ?? null,
        data.currentPage ?? null,
        data.lastPageMarkedAt ? new Date(data.lastPageMarkedAt) : null,
        data.coverUrl ?? null,
        data.isFavorite ?? false
      ]
    );
    return mapRow(result.rows[0]);
  }

  async update(id: string, data: UpdateBookDto, userId: string): Promise<Book | undefined> {
    const setParts: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    const add = (column: string, value: unknown) => {
      setParts.push(`${column} = $${idx}`);
      values.push(value);
      idx += 1;
    };

    if (data.title !== undefined) add("title", data.title);
    if (data.author !== undefined) add("author", data.author);
    if (data.publisher !== undefined) add("publisher", data.publisher);
    if (data.genre !== undefined) add("genre", data.genre);
    if (data.pages !== undefined) add("pages", data.pages);
    if (data.publicationYear !== undefined) add("publication_year", data.publicationYear);
    if (data.status !== undefined) add("status", data.status);
    if (data.rating !== undefined) add("rating", data.rating);
    if (data.review !== undefined) add("review", data.review);
    if (data.reviewTags !== undefined) add("review_tags", data.reviewTags);
    if (data.synopsis !== undefined) add("synopsis", data.synopsis);
    if (data.readAt !== undefined) add("read_at", data.readAt);
    if (data.timesRead !== undefined) add("times_read", data.timesRead);
    if (data.favoriteQuote !== undefined) add("favorite_quote", data.favoriteQuote);
    if (data.wouldRecommend !== undefined) add("would_recommend", data.wouldRecommend);
    if (data.progress !== undefined) add("progress", data.progress);
    if (data.currentPage !== undefined) add("current_page", data.currentPage);
    if (data.lastPageMarkedAt !== undefined) add("last_page_marked_at", data.lastPageMarkedAt ? new Date(data.lastPageMarkedAt) : null);
    if (data.coverUrl !== undefined) add("cover_url", data.coverUrl);
    if (data.isFavorite !== undefined) add("is_favorite", data.isFavorite);

    add("updated_at", new Date());

    const result = await pool.query<BookRow>(
      `UPDATE books
       SET ${setParts.join(", ")}
       WHERE id = $${idx} AND user_id = $${idx + 1}
       RETURNING *`,
      [...values, id, userId]
    );

    const row = result.rows[0];
    return row ? mapRow(row) : undefined;
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const result = await pool.query("DELETE FROM books WHERE id = $1 AND user_id = $2", [id, userId]);
    return (result.rowCount ?? 0) > 0;
  }
}
