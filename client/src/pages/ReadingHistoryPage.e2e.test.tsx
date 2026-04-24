// E2E de frontend para flujos críticos del historial (ver, abrir libro y borrar sesión).
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";

const { navigateMock, reloadBooksMock, getReadingSessionsMock, deleteReadingSessionMock } = vi.hoisted(
  () => ({
    navigateMock: vi.fn(),
    reloadBooksMock: vi.fn(),
    getReadingSessionsMock: vi.fn(),
    deleteReadingSessionMock: vi.fn()
  })
);

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => navigateMock
  };
});

vi.mock("../context/AuthContext", () => ({
  useAuth: () => ({ isAuthenticated: true })
}));

vi.mock("../hooks/useFullBooksSnapshot", () => ({
  useFullBooksSnapshot: () => ({
    books: [
      {
        id: "book-1",
        title: "Dune",
        author: "Frank Herbert",
        genre: "Sci-Fi",
        publisher: "Ace",
        status: "leyendo",
        progress: 40,
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      }
    ],
    loading: false,
    error: null
  })
}));

vi.mock("../context/BooksContext", () => ({
  useBooksContext: () => ({
    reloadBooks: reloadBooksMock
  })
}));

vi.mock("../api/client", async () => {
  const actual = await vi.importActual<object>("../api/client");
  return {
    ...actual,
    getReadingSessions: getReadingSessionsMock,
    deleteReadingSession: deleteReadingSessionMock
  };
});

const renderPage = async () => {
  const { ReadingHistoryPage } = await import("./ReadingHistoryPage");
  return render(
    <MemoryRouter
      initialEntries={["/history"]}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <ReadingHistoryPage />
    </MemoryRouter>
  );
};

describe("ReadingHistoryPage critical flows", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows reading session in history (mark page -> appears history)", async () => {
    const now = new Date();
    getReadingSessionsMock.mockResolvedValue([
      {
        id: "session-1",
        userId: "user-1",
        bookId: "book-1",
        title: "Dune",
        author: "Frank Herbert",
        previousPage: 20,
        currentPage: 35,
        pagesRead: 15,
        recordedAt: now.toISOString(),
        createdAt: now.toISOString()
      }
    ]);

    await renderPage();

    await waitFor(() => {
      expect(screen.getByText("Dune")).toBeInTheDocument();
    });
  });

  it("opens book from history keeping modal preview context", async () => {
    const now = new Date();
    getReadingSessionsMock.mockResolvedValue([
      {
        id: "session-1",
        userId: "user-1",
        bookId: "book-1",
        title: "Dune",
        author: "Frank Herbert",
        previousPage: 20,
        currentPage: 35,
        pagesRead: 15,
        recordedAt: now.toISOString(),
        createdAt: now.toISOString()
      }
    ]);
    deleteReadingSessionMock.mockResolvedValue({ id: "session-1" });

    await renderPage();

    await screen.findAllByText("✦ Historial de lectura");
    const calendarDayButtons = Array.from(document.querySelectorAll("button")).filter(
      (button) => button.textContent?.includes("Dune") && button.className.includes("cursor-pointer")
    );
    expect(calendarDayButtons.length).toBeGreaterThan(0);
    fireEvent.click(calendarDayButtons[calendarDayButtons.length - 1]!);

    expect(await screen.findByText("Detalle del día")).toBeInTheDocument();
    const dayPanelTitleButton = screen.getAllByRole("button", { name: "Dune" })[0];
    fireEvent.click(dayPanelTitleButton);

    expect(navigateMock).toHaveBeenCalledWith("/?preview=book-1", {
      state: expect.objectContaining({
        previewOnly: true
      })
    });
  });

  it("deletes a session from day detail and refreshes books data", async () => {
    const now = new Date();
    getReadingSessionsMock.mockResolvedValue([
      {
        id: "session-1",
        userId: "user-1",
        bookId: "book-1",
        title: "Dune",
        author: "Frank Herbert",
        previousPage: 20,
        currentPage: 35,
        pagesRead: 15,
        recordedAt: now.toISOString(),
        createdAt: now.toISOString()
      }
    ]);
    deleteReadingSessionMock.mockResolvedValue({ id: "session-1" });

    await renderPage();

    await screen.findAllByText("✦ Historial de lectura");
    const calendarDayButtons = Array.from(document.querySelectorAll("button")).filter(
      (button) => button.textContent?.includes("Dune") && button.className.includes("cursor-pointer")
    );
    expect(calendarDayButtons.length).toBeGreaterThan(0);
    fireEvent.click(calendarDayButtons[calendarDayButtons.length - 1]!);

    expect(await screen.findByText("Detalle del día")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Borrar sesión" }));
    await waitFor(() => {
      expect(screen.queryByText("Detalle del día")).not.toBeInTheDocument();
    });
    expect(reloadBooksMock).toHaveBeenCalled();
  });
});
