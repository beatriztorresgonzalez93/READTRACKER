// Middleware JWT para proteger rutas y adjuntar userId a la request.
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

interface TokenPayload {
  sub?: string;
}

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    res.status(401).json({ error: "No autorizado" });
    return;
  }

  const token = header.slice("Bearer ".length).trim();
  try {
    const payload = jwt.verify(token, env.jwtSecret) as TokenPayload;
    if (!payload.sub) {
      res.status(401).json({ error: "Token inválido" });
      return;
    }
    res.locals.userId = payload.sub;
    next();
  } catch {
    res.status(401).json({ error: "Token inválido o expirado" });
  }
};
