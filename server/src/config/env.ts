// Carga y exporta variables de entorno del backend con valores por defecto.
import dotenv from "dotenv";

dotenv.config();

function parseClientOrigins(): string[] {
  const multi = process.env.CLIENT_ORIGINS;
  if (multi?.trim()) {
    return multi.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return [process.env.CLIENT_ORIGIN ?? "http://localhost:5173"];
}

export const env = {
  port: Number(process.env.PORT ?? 4000),
  clientOrigins: parseClientOrigins(),
  databaseUrl: process.env.DATABASE_URL ?? ""
};
