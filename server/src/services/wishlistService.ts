// Lógica de negocio para la lista de deseos.
import { WishlistRepository } from "../repositories/wishlistRepository";
import { CreateWishlistItemDto, WishlistItem } from "../types/wishlist";

export class WishlistService {
  constructor(private readonly repository: WishlistRepository) {}

  async list(userId: string): Promise<WishlistItem[]> {
    return this.repository.findAllByUserId(userId);
  }

  async create(userId: string, dto: CreateWishlistItemDto): Promise<WishlistItem> {
    return this.repository.create(userId, dto);
  }

  async remove(userId: string, id: string): Promise<boolean> {
    return this.repository.deleteById(userId, id);
  }
}
