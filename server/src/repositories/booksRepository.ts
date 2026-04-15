// Capa de acceso a datos en PostgreSQL (Neon) para libros.
import { randomUUID } from "crypto";
import { pool } from "../config/db";
import { Book, CreateBookDto, UpdateBookDto } from "../types/book";

interface BookRow {
  id: string;
  title: string;
  author: string;
  genre: string;
  publication_year: number | null;
  status: Book["status"];
  rating: number | null;
  review: string | null;
  progress: number | null;
  cover_url: string | null;
  created_at: Date;
  updated_at: Date;
}

const mapRow = (row: BookRow): Book => ({
  id: row.id,
  title: row.title,
  author: row.author,
  genre: row.genre,
  publicationYear: row.publication_year ?? undefined,
  status: row.status,
  rating: row.rating ?? undefined,
  review: row.review ?? undefined,
  progress: row.progress ?? undefined,
  coverUrl: row.cover_url ?? undefined,
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
      clauses.push(`(title ILIKE $${idx} OR author ILIKE $${idx} OR genre ILIKE $${idx})`);
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
      `INSERT INTO books (id, user_id, title, author, genre, publication_year, status, rating, review, progress, cover_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING *`,
      [
        id,
        userId,
        data.title,
        data.author,
        data.genre,
        data.publicationYear ?? null,
        data.status,
        data.rating ?? null,
        data.review ?? null,
        data.progress ?? null,
        data.coverUrl ?? null
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
    if (data.genre !== undefined) add("genre", data.genre);
    if (data.publicationYear !== undefined) add("publication_year", data.publicationYear);
    if (data.status !== undefined) add("status", data.status);
    if (data.rating !== undefined) add("rating", data.rating);
    if (data.review !== undefined) add("review", data.review);
    if (data.progress !== undefined) add("progress", data.progress);
    if (data.coverUrl !== undefined) add("cover_url", data.coverUrl);

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
