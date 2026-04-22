// Punto de entrada del backend: configura Express, middlewares y rutas principales.
import cors from "cors";
import express from "express";
import { initDb } from "./config/db";
import { env } from "./config/env";
import { BooksController } from "./controllers/booksController";
import { CoversController } from "./controllers/coversController";
import { AuthController } from "./controllers/authController";
import { WishlistController } from "./controllers/wishlistController";
import { errorHandler } from "./middlewares/errorHandler";
import { BooksRepository } from "./repositories/booksRepository";
import { UsersRepository } from "./repositories/usersRepository";
import { WishlistRepository } from "./repositories/wishlistRepository";
import { createAuthRouter } from "./routes/authRoutes";
import { createBooksRouter } from "./routes/booksRoutes";
import { createCoversRouter } from "./routes/coversRoutes";
import { createWishlistRouter } from "./routes/wishlistRoutes";
import { AuthService } from "./services/authService";
import { BooksService } from "./services/booksService";
import { CoversService } from "./services/coversService";
import { WishlistService } from "./services/wishlistService";

const app = express();

function normalizeOrigin(origin: string): string {
  // El header `Origin` normalmente viene sin path; normalizamos también
  // un slash final accidental y forzamos minúsculas.
  return origin.trim().replace(/\/$/, "").toLowerCase();
}

function isCorsAllowedOrigin(origin: string): boolean {
  const normalized = normalizeOrigin(origin);
  if (env.clientOrigins.includes(normalized)) {
    return true;
  }
  // Vercel usa dominios dinámicos por deployment; aceptar subdominios vercel.app
  // evita tener que tocar CORS en cada nuevo build.
  if (normalized.startsWith("https://") && normalized.endsWith(".vercel.app")) {
    return true;
  }
  if (!normalized.startsWith("https://")) {
    return false;
  }
  return env.corsOriginSuffixes.some((suffix) => normalized.endsWith(suffix));
}

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }
      callback(null, isCorsAllowedOrigin(origin));
    }
  })
);
app.use(express.json());

const booksRepository = new BooksRepository();
const booksService = new BooksService(booksRepository);
const booksController = new BooksController(booksService);
const usersRepository = new UsersRepository();
const authService = new AuthService(usersRepository);
const authController = new AuthController(authService);
const coversService = new CoversService();
const coversController = new CoversController(coversService);
const wishlistRepository = new WishlistRepository();
const wishlistService = new WishlistService(wishlistRepository);
const wishlistController = new WishlistController(wishlistService);

app.get("/api/v1/health", (_req, res) => {
  res.status(200).json({ data: { status: "ok" } });
});

app.use("/api/v1/covers", createCoversRouter(coversController));
app.use("/api/v1/auth", createAuthRouter(authController));

app.use("/api/v1/books", createBooksRouter(booksController));
app.use("/api/v1/wishlist", createWishlistRouter(wishlistController));

app.use((_req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

app.use(errorHandler);

const startServer = async () => {
  await initDb();
  app.listen(env.port, () => {
    console.log(`ReadTracker API running on http://localhost:${env.port}`);
  });
};

void startServer();
