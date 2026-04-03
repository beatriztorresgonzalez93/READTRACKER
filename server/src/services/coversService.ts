// Búsqueda de URLs de portada vía Open Library y fallback a Google Books.

export class CoversSearchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CoversSearchError";
  }
}

type OpenLibrarySearchDoc = { cover_i?: number };

type OpenLibrarySearchJson = {
  docs?: OpenLibrarySearchDoc[];
};

type GoogleVolumeItem = {
  volumeInfo?: {
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
    };
  };
};

type GoogleBooksJson = {
  items?: GoogleVolumeItem[];
};

const OPEN_LIBRARY_LIMIT = 12;
const RESULT_LIMIT = 8;

export class CoversService {
  async searchByTitle(title: string): Promise<string[]> {
    const openLibraryResponse = await fetch(
      `https://openlibrary.org/search.json?title=${encodeURIComponent(title)}&limit=${OPEN_LIBRARY_LIMIT}`
    );

    if (openLibraryResponse.ok) {
      const data = (await openLibraryResponse.json()) as OpenLibrarySearchJson;
      const covers = (data.docs ?? [])
        .filter((doc) => typeof doc.cover_i === "number")
        .map((doc) => `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`)
        .slice(0, RESULT_LIMIT);

      if (covers.length > 0) {
        return covers;
      }
    }

    const googleBooksResponse = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(title)}&maxResults=10`
    );

    if (!googleBooksResponse.ok) {
      throw new CoversSearchError("No se pudo consultar proveedores de portadas");
    }

    const googleData = (await googleBooksResponse.json()) as GoogleBooksJson;

    return (googleData.items ?? [])
      .map(
        (item) =>
          item.volumeInfo?.imageLinks?.thumbnail ?? item.volumeInfo?.imageLinks?.smallThumbnail
      )
      .filter((url): url is string => typeof url === "string")
      .map((url) => url.replace("http://", "https://"))
      .slice(0, RESULT_LIMIT);
  }
}
