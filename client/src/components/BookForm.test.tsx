// Pruebas de BookForm: validaciones básicas y payload enviado según estado.
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { BookForm } from "./BookForm";

describe("BookForm", () => {
  it("no envía el formulario y muestra errores si faltan título, autor o género", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const { container } = render(<BookForm onSubmit={onSubmit} />);
    const formEl = container.querySelector("form");
    expect(formEl).toBeTruthy();

    await user.click(within(formEl!).getByRole("button", { name: /guardar libro/i }));

    expect(screen.getByText("El título es requerido")).toBeInTheDocument();
    expect(screen.getByText("El autor es requerido")).toBeInTheDocument();
    expect(screen.getByText("El género es requerido")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("al elegir estado leído envía progreso 100 en el payload", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const { container } = render(<BookForm onSubmit={onSubmit} />);

    const formEl = container.querySelector("form");
    expect(formEl).toBeTruthy();
    const textboxes = within(formEl!).getAllByRole("textbox");
    // Orden: título, autor, género, reseña, URL portada, búsqueda portada
    await user.type(textboxes[0]!, "El nombre del viento");
    await user.type(textboxes[1]!, "Patrick Rothfuss");
    await user.type(textboxes[2]!, "Fantasía");

    const statusSelect = within(formEl!).getByRole("combobox");
    await user.selectOptions(statusSelect, "leido");
    await user.click(within(formEl!).getByRole("button", { name: /guardar libro/i }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "El nombre del viento",
        author: "Patrick Rothfuss",
        genre: "Fantasía",
        status: "leido",
        progress: 100,
      })
    );
  });
});
