// Acceso a datos de usuarios para autenticación.
import { randomUUID } from "crypto";
import { pool } from "../config/db";
import { AuthUser } from "../types/auth";

interface UserRow {
  id: string;
  name: string;
  last_name: string;
  email: string;
  password_hash: string;
  created_at: Date;
  avatar_url: string | null;
}

const mapUser = (row: UserRow): AuthUser => ({
  id: row.id,
  name: row.name,
  lastName: (row.last_name ?? "").trim(),
  email: row.email,
  avatarUrl: row.avatar_url?.trim() ? row.avatar_url.trim() : null,
  createdAt: row.created_at.toISOString()
});

export class UsersRepository {
  async findByEmail(email: string): Promise<(AuthUser & { passwordHash: string }) | null> {
    const result = await pool.query<UserRow>(
      "SELECT id, name, last_name, email, password_hash, created_at, avatar_url FROM users WHERE email = $1 LIMIT 1",
      [email]
    );
    const row = result.rows[0];
    if (!row) return null;
    return {
      ...mapUser(row),
      passwordHash: row.password_hash
    };
  }

  async findById(id: string): Promise<AuthUser | null> {
    const result = await pool.query<UserRow>(
      "SELECT id, name, last_name, email, password_hash, created_at, avatar_url FROM users WHERE id = $1 LIMIT 1",
      [id]
    );
    const row = result.rows[0];
    return row ? mapUser(row) : null;
  }

  async create(name: string, email: string, passwordHash: string): Promise<AuthUser> {
    const result = await pool.query<UserRow>(
      `INSERT INTO users (id, name, email, password_hash)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, last_name, email, password_hash, created_at, avatar_url`,
      [randomUUID(), name, email, passwordHash]
    );
    return mapUser(result.rows[0]);
  }

  async updateProfile(
    id: string,
    updates: { name: string; lastName: string; avatarUrl: string | null }
  ): Promise<AuthUser | null> {
    const result = await pool.query<UserRow>(
      `UPDATE users
       SET name = $2, last_name = $3, avatar_url = $4
       WHERE id = $1
       RETURNING id, name, last_name, email, password_hash, created_at, avatar_url`,
      [id, updates.name, updates.lastName, updates.avatarUrl]
    );
    const row = result.rows[0];
    return row ? mapUser(row) : null;
  }
}
