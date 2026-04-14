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
    CREATE TABLE IF NOT EXISTS books (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      genre TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('pendiente', 'leyendo', 'leido')),
      rating INTEGER,
      review TEXT,
      progress INTEGER,
      cover_url TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    ALTER TABLE books
    ADD COLUMN IF NOT EXISTS publication_year INTEGER;
  `);
};
