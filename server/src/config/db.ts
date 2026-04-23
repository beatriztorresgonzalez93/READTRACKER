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
      review_tags TEXT[] DEFAULT '{}'::TEXT[],
      read_at TEXT,
      times_read TEXT,
      favorite_quote TEXT,
      would_recommend TEXT,
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
    ALTER TABLE books
    ADD COLUMN IF NOT EXISTS synopsis TEXT;
  `);

  await pool.query(`
    ALTER TABLE books
    ADD COLUMN IF NOT EXISTS read_at TEXT;
  `);

  await pool.query(`
    ALTER TABLE books
    ADD COLUMN IF NOT EXISTS times_read TEXT;
  `);

  await pool.query(`
    ALTER TABLE books
    ADD COLUMN IF NOT EXISTS favorite_quote TEXT;
  `);

  await pool.query(`
    ALTER TABLE books
    ADD COLUMN IF NOT EXISTS would_recommend TEXT;
  `);

  await pool.query(`
    ALTER TABLE books
    ADD COLUMN IF NOT EXISTS review_tags TEXT[] DEFAULT '{}'::TEXT[];
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_books_user_id ON books(user_id);
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS wishlist_items (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      price TEXT NOT NULL DEFAULT '',
      store TEXT NOT NULL DEFAULT '',
      priority INTEGER NOT NULL CHECK (priority >= 1 AND priority <= 5),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    ALTER TABLE wishlist_items
    ADD COLUMN IF NOT EXISTS price TEXT NOT NULL DEFAULT '';
  `);

  await pool.query(`
    ALTER TABLE wishlist_items
    ADD COLUMN IF NOT EXISTS store TEXT NOT NULL DEFAULT '';
  `);

  // Compatibilidad con instalaciones antiguas donde `genre` era NOT NULL sin default.
  // Si la columna existe, asegurar default evita que falle el INSERT nuevo (price/store).
  await pool.query(`
    ALTER TABLE wishlist_items
    ADD COLUMN IF NOT EXISTS genre TEXT NOT NULL DEFAULT '';
  `);

  await pool.query(`
    ALTER TABLE wishlist_items
    ALTER COLUMN genre SET DEFAULT '';
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_wishlist_items_user_id ON wishlist_items(user_id);
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS wishlist_acquisitions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      price TEXT NOT NULL DEFAULT '',
      store TEXT NOT NULL DEFAULT '',
      purchased_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_wishlist_acquisitions_user_id ON wishlist_acquisitions(user_id);
  `);
};
