// Middleware global para capturar errores no controlados y responder 500.
import { NextFunction, Request, Response } from "express";
import { logError } from "../logger";

export const errorHandler = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  logError("errorHandler", error);
  res.status(500).json({ error: "Error interno del servidor" });
};
