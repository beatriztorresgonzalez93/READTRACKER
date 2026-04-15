// Capa HTTP para registro, login y perfil autenticado.
import { Request, Response } from "express";
import { logError } from "../logger";
import { AuthService } from "../services/authService";

export class AuthController {
  constructor(private readonly service: AuthService) {}

  register = async (req: Request, res: Response) => {
    const { name, email, password } = req.body as Record<string, unknown>;
    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      !name.trim() ||
      !email.trim() ||
      password.length < 6
    ) {
      res.status(400).json({
        error: "Nombre, email y contraseña (mínimo 6 caracteres) son obligatorios"
      });
      return;
    }

    try {
      const data = await this.service.register({ name, email, password });
      res.status(201).json({ data });
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo registrar el usuario";
      const status = message.includes("Ya existe") ? 409 : 500;
      if (status === 500) {
        logError("AuthController.register", err);
      }
      res.status(status).json({ error: message });
    }
  };

  login = async (req: Request, res: Response) => {
    const { email, password } = req.body as Record<string, unknown>;
    if (typeof email !== "string" || typeof password !== "string" || !email.trim() || !password) {
      res.status(400).json({ error: "Email y contraseña son obligatorios" });
      return;
    }

    try {
      const data = await this.service.login({ email, password });
      res.status(200).json({ data });
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo iniciar sesión";
      const status = message.includes("incorrectos") ? 401 : 500;
      if (status === 500) {
        logError("AuthController.login", err);
      }
      res.status(status).json({ error: message });
    }
  };

  me = async (req: Request, res: Response) => {
    const userId = res.locals.userId as string | undefined;
    if (!userId) {
      res.status(401).json({ error: "No autorizado" });
      return;
    }

    try {
      const user = await this.service.getProfile(userId);
      if (!user) {
        res.status(404).json({ error: "Usuario no encontrado" });
        return;
      }
      res.status(200).json({ data: user });
    } catch (err) {
      logError("AuthController.me", err);
      res.status(500).json({ error: "No se pudo cargar el perfil" });
    }
  };
}
