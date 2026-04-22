// Rutas REST de lista de deseos (por usuario autenticado).
import { Router } from "express";
import { WishlistController } from "../controllers/wishlistController";
import { requireAuth } from "../middlewares/requireAuth";
import { validateCreateWishlistItem } from "../middlewares/validateWishlistPayload";

export const createWishlistRouter = (controller: WishlistController) => {
  const router = Router();
  router.use(requireAuth);

  router.get("/", controller.list);
  router.post("/", validateCreateWishlistItem, controller.create);
  router.delete("/:id", controller.remove);

  return router;
};
