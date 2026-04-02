// Punto de entrada del backend: configura Express, middlewares y rutas principales.
import cors from "cors";
import express from "express";
import { initDb } from "./config/db";
import { env } from "./config/env";
import { BooksController } from "./controllers/booksController";
import { errorHandler } from "./middlewares/errorHandler";
import { BooksRepository } from "./repositories/booksRepository";
import { createBooksRouter } from "./routes/booksRoutes";
import { BooksService } from "./services/booksService";

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

app.get("/api/v1/health", (_req, res) => {
  res.status(200).json({ data: { status: "ok" } });
});

app.get("/api/v1/covers/search", async (req, res) => {
  const title = typeof req.query.title === "string" ? req.query.title.trim() : "";
  if (!title) {
    res.status(400).json({ error: "title es requerido" });
    return;
  }

  try {
    const openLibraryResponse = await fetch(
      `https://openlibrary.org/search.json?title=${encodeURIComponent(title)}&limit=12`
    );

    if (openLibraryResponse.ok) {
      const data = (await openLibraryResponse.json()) as { docs?: Array<{ cover_i?: number }> };
      const covers = (data.docs ?? [])
        .filter((doc) => typeof doc.cover_i === "number")
        .map((doc) => `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`)
        .slice(0, 8);

      if (covers.length > 0) {
        res.status(200).json({ data: covers });
        return;
      }
    }

    // Fallback: Google Books suele funcionar en redes donde Open Library falla.
    const googleBooksResponse = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(title)}&maxResults=10`
    );

    if (!googleBooksResponse.ok) {
      res.status(502).json({ error: "No se pudo consultar proveedores de portadas" });
      return;
    }

    const googleData = (await googleBooksResponse.json()) as {
      items?: Array<{
        volumeInfo?: {
          imageLinks?: {
            thumbnail?: string;
            smallThumbnail?: string;
          };
        };
      }>;
    };

    const covers = (googleData.items ?? [])
      .map((item) => item.volumeInfo?.imageLinks?.thumbnail ?? item.volumeInfo?.imageLinks?.smallThumbnail)
      .filter((url): url is string => typeof url === "string")
      .map((url) => url.replace("http://", "https://"))
      .slice(0, 8);

    res.status(200).json({ data: covers });
  } catch {
    res.status(502).json({ error: "No se pudo buscar portadas en este momento" });
  }
});

app.use("/api/v1/books", createBooksRouter(booksController));

app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use(errorHandler);

const startServer = async () => {
  await initDb();
  app.listen(env.port, () => {
    console.log(`ReadTracker API running on http://localhost:${env.port}`);
  });
};

void startServer();
