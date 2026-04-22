// Contratos de datos para la lista de deseos por usuario.
export type WishlistPriority = 1 | 2 | 3 | 4 | 5;

export interface WishlistItem {
  id: string;
  title: string;
  author: string;
  genre: string;
  priority: WishlistPriority;
  createdAt: string;
}

export interface CreateWishlistItemDto {
  title: string;
  author: string;
  genre?: string;
  priority?: WishlistPriority;
}
