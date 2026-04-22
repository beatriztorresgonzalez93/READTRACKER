// Configura conexión a PostgreSQL (Neon) y asegura la tabla books al iniciar.
import { Pool } from "pg";
import { env } from "./env";

if (!env.databaseUrl) {
  throw new Error("Falta DATABASE_URL en las variables de entorno");
}

export const pool = new Pool({
  connectionString: env.databaseUrl,
  ssl: { rejectUnauthorized: false }
});

export const initDb = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS books (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      publisher TEXT NOT NULL DEFAULT '',
      genre TEXT NOT NULL,
      pages INTEGER,
      status TEXT NOT NULL CHECK (status IN ('pendiente', 'leyendo', 'leido')),
      rating INTEGER,
      review TEXT,
      progress INTEGER,
      current_page INTEGER,
      last_page_marked_at TIMESTAMPTZ,
      cover_url TEXT,
      is_favorite BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    ALTER TABLE books
    ADD COLUMN IF NOT EXISTS publication_year INTEGER;
  `);

  await pool.query(`
    ALTER TABLE books
    ADD COLUMN IF NOT EXISTS pages INTEGER;
  `);

  await pool.query(`
    ALTER TABLE books
    ADD COLUMN IF NOT EXISTS publisher TEXT NOT NULL DEFAULT '';
  `);

  await pool.query(`
    ALTER TABLE books
    ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES users(id) ON DELETE CASCADE;
  `);

  await pool.query(`
    ALTER TABLE books
    ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN NOT NULL DEFAULT FALSE;
  `);

  await pool.query(`
    ALTER TABLE books
    ADD COLUMN IF NOT EXISTS current_page INTEGER;
  `);

  await pool.query(`
    ALTER TABLE books
    ADD COLUMN IF NOT EXISTS last_page_marked_at TIMESTAMPTZ;
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_books_user_id ON books(user_id);
  `);
};
