// Ítem de lista de deseos (coincide con la API).
export type WishlistPriority = 1 | 2 | 3 | 4 | 5;

export interface WishlistItem {
  id: string;
  title: string;
  author: string;
  price: string;
  store: string;
  priority: WishlistPriority;
  createdAt: string;
}

export interface WishlistAcquisition {
  id: string;
  title: string;
  author: string;
  price: string;
  store: string;
  purchasedAt: string;
}
