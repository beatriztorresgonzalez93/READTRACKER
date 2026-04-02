// Carga y exporta variables de entorno del backend con valores por defecto.
import dotenv from "dotenv";

dotenv.config();

function normalizeOrigin(origin: string): string {
  // El header `Origin` en el navegador no incluye path, pero a veces el valor en env
  // se guarda con slash final ("/") o con mayúsculas.
  return origin.trim().replace(/\/$/, "").toLowerCase();
}

function parseClientOrigins(): string[] {
  const multi = process.env.CLIENT_ORIGINS;
  if (multi?.trim()) {
    return multi
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map(normalizeOrigin);
  }
  return [normalizeOrigin(process.env.CLIENT_ORIGIN ?? "http://localhost:5173")];
}

/** Sufijos HTTPS de host (p. ej. previews Vercel: `-teamslug.vercel.app`) — una URL por preview distinta. */
function parseCorsOriginSuffixes(): string[] {
  return (
    process.env.CORS_ORIGIN_SUFFIXES?.split(",").map((s) => s.trim()).filter(Boolean) ?? []
  );
}

export const env = {
  port: Number(process.env.PORT ?? 4000),
  clientOrigins: parseClientOrigins(),
  /** Orígenes https://... que terminan en uno de estos sufijos pasan CORS (útil para previews Vercel). */
  corsOriginSuffixes: parseCorsOriginSuffixes(),
  databaseUrl: process.env.DATABASE_URL ?? ""
};
