// Acceso a datos de la lista de deseos por usuario.
import { randomUUID } from "crypto";
import { pool } from "../config/db";
import { CreateWishlistItemDto, WishlistItem, WishlistPriority } from "../types/wishlist";

interface WishlistRow {
  id: string;
  title: string;
  author: string;
  genre: string;
  priority: number;
  created_at: Date;
}

const mapRow = (row: WishlistRow): WishlistItem => ({
  id: row.id,
  title: row.title,
  author: row.author,
  genre: row.genre,
  priority: row.priority as WishlistPriority,
  createdAt: row.created_at.toISOString()
});

export class WishlistRepository {
  async findAllByUserId(userId: string): Promise<WishlistItem[]> {
    const result = await pool.query<WishlistRow>(
      "SELECT id, title, author, genre, priority, created_at FROM wishlist_items WHERE user_id = $1 ORDER BY created_at DESC",
      [userId]
    );
    return result.rows.map(mapRow);
  }

  async create(userId: string, dto: CreateWishlistItemDto): Promise<WishlistItem> {
    const id = randomUUID();
    const genre = dto.genre?.trim() || "General";
    const priority = (dto.priority ?? 3) as WishlistPriority;
    const result = await pool.query<WishlistRow>(
      `INSERT INTO wishlist_items (id, user_id, title, author, genre, priority)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, title, author, genre, priority, created_at`,
      [id, userId, dto.title.trim(), dto.author.trim(), genre, priority]
    );
    const row = result.rows[0];
    if (!row) {
      throw new Error("No se pudo crear el deseo");
    }
    return mapRow(row);
  }

  async deleteById(userId: string, id: string): Promise<boolean> {
    const result = await pool.query("DELETE FROM wishlist_items WHERE id = $1 AND user_id = $2", [id, userId]);
    return (result.rowCount ?? 0) > 0;
  }
}
