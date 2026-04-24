// Capa HTTP para registro, login y perfil autenticado.
import { Request, Response } from "express";
import { logError } from "../logger";
import { AuthService } from "../services/authService";
import { sendApiError } from "../utils/apiResponse";

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
      sendApiError(
        res,
        400,
        "INVALID_REGISTER_PAYLOAD",
        "Nombre, email y contraseña (mínimo 6 caracteres) son obligatorios"
      );
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
      sendApiError(
        res,
        status,
        status === 409 ? "USER_ALREADY_EXISTS" : "REGISTER_FAILED",
        message
      );
    }
  };

  login = async (req: Request, res: Response) => {
    const { email, password } = req.body as Record<string, unknown>;
    if (typeof email !== "string" || typeof password !== "string" || !email.trim() || !password) {
      sendApiError(res, 400, "INVALID_LOGIN_PAYLOAD", "Email y contraseña son obligatorios");
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
      sendApiError(
        res,
        status,
        status === 401 ? "INVALID_CREDENTIALS" : "LOGIN_FAILED",
        message
      );
    }
  };

  me = async (req: Request, res: Response) => {
    const userId = res.locals.userId as string | undefined;
    if (!userId) {
      sendApiError(res, 401, "AUTH_REQUIRED", "No autorizado");
      return;
    }

    try {
      const user = await this.service.getProfile(userId);
      if (!user) {
        sendApiError(res, 404, "USER_NOT_FOUND", "Usuario no encontrado");
        return;
      }
      res.status(200).json({ data: user });
    } catch (err) {
      logError("AuthController.me", err);
      sendApiError(res, 500, "PROFILE_LOAD_FAILED", "No se pudo cargar el perfil");
    }
  };
}
