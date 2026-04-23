// HTTP para lista de deseos por usuario autenticado.
import { Request, Response } from "express";
import { logError } from "../logger";
import { WishlistService } from "../services/wishlistService";

export class WishlistController {
  constructor(private readonly service: WishlistService) {}

  private getSingleParamValue(value: unknown): string | null {
    return typeof value === "string" ? value : null;
  }

  list = async (_req: Request, res: Response) => {
    const userId = res.locals.userId as string | undefined;
    if (!userId) {
      res.status(401).json({ error: "No autorizado" });
      return;
    }
    try {
      const items = await this.service.list(userId);
      res.status(200).json({ data: items });
    } catch (err) {
      logError("WishlistController.list", err);
      res.status(500).json({ error: "No se pudo cargar la lista de deseos" });
    }
  };

  listAcquisitions = async (_req: Request, res: Response) => {
    const userId = res.locals.userId as string | undefined;
    if (!userId) {
      res.status(401).json({ error: "No autorizado" });
      return;
    }
    try {
      const items = await this.service.listAcquisitions(userId);
      res.status(200).json({ data: items });
    } catch (err) {
      logError("WishlistController.listAcquisitions", err);
      res.status(500).json({ error: "No se pudieron cargar las adquisiciones" });
    }
  };

  create = async (req: Request, res: Response) => {
    const userId = res.locals.userId as string | undefined;
    if (!userId) {
      res.status(401).json({ error: "No autorizado" });
      return;
    }
    try {
      const item = await this.service.create(userId, req.body);
      res.status(201).json({ data: item });
    } catch (err) {
      logError("WishlistController.create", err);
      res.status(500).json({ error: "No se pudo guardar el deseo" });
    }
  };

  update = async (req: Request, res: Response) => {
    const userId = res.locals.userId as string | undefined;
    if (!userId) {
      res.status(401).json({ error: "No autorizado" });
      return;
    }
    const id = this.getSingleParamValue(req.params.id);
    if (!id) {
      res.status(400).json({ error: "El id no es válido" });
      return;
    }
    try {
      const item = await this.service.update(userId, id, req.body);
      if (!item) {
        res.status(404).json({ error: "Deseo no encontrado" });
        return;
      }
      res.status(200).json({ data: item });
    } catch (err) {
      logError("WishlistController.update", err);
      res.status(500).json({ error: "No se pudo actualizar el deseo" });
    }
  };

  remove = async (req: Request, res: Response) => {
    const userId = res.locals.userId as string | undefined;
    if (!userId) {
      res.status(401).json({ error: "No autorizado" });
      return;
    }
    const id = this.getSingleParamValue(req.params.id);
    if (!id) {
      res.status(400).json({ error: "El id no es válido" });
      return;
    }
    try {
      const removed = await this.service.remove(userId, id);
      if (!removed) {
        res.status(404).json({ error: "Deseo no encontrado" });
        return;
      }
      res.status(200).json({ data: { id } });
    } catch (err) {
      logError("WishlistController.remove", err);
      res.status(500).json({ error: "No se pudo eliminar el deseo" });
    }
  };

  purchase = async (req: Request, res: Response) => {
    const userId = res.locals.userId as string | undefined;
    if (!userId) {
      res.status(401).json({ error: "No autorizado" });
      return;
    }
    const id = this.getSingleParamValue(req.params.id);
    if (!id) {
      res.status(400).json({ error: "El id no es válido" });
      return;
    }
    try {
      const acquired = await this.service.purchase(userId, id);
      if (!acquired) {
        res.status(404).json({ error: "Deseo no encontrado" });
        return;
      }
      res.status(200).json({ data: acquired });
    } catch (err) {
      logError("WishlistController.purchase", err);
      res.status(500).json({ error: "No se pudo completar la compra" });
    }
  };
}
