// Pruebas unitarias de apiFetch: éxito, errores HTTP y fallback de mensaje.
import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError, apiFetch } from "./client";

describe("apiFetch", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("concatena la base URL y devuelve el JSON en éxito", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ data: [{ id: "1", title: "X" }] }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await apiFetch<{ data: { id: string; title: string }[] }>("/books?search=a");

    expect(result.data).toHaveLength(1);
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:4000/api/v1/books?search=a",
      expect.objectContaining({
        headers: expect.objectContaining({ "Content-Type": "application/json" }),
      })
    );
  });

  it("lanza ApiError con el mensaje del cuerpo cuando response.ok es false", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 422,
        json: async () => ({ error: "Payload inválido" }),
      })
    );

    await expect(apiFetch("/books")).rejects.toEqual(
      expect.objectContaining({
        name: "ApiError",
        message: "Payload inválido",
        status: 422,
      })
    );
  });

  it("usa mensaje genérico si el cuerpo de error no es JSON válido", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => {
          throw new SyntaxError("bad json");
        },
      })
    );

    try {
      await apiFetch("/books");
      expect.fail("debería lanzar");
    } catch (e) {
      expect(e).toBeInstanceOf(ApiError);
      expect((e as ApiError).message).toBe("No se pudo completar la petición");
      expect((e as ApiError).status).toBe(500);
    }
  });
});
