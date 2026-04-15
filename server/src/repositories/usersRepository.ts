// Acceso a datos de usuarios para autenticación.
import { randomUUID } from "crypto";
import { pool } from "../config/db";
import { AuthUser } from "../types/auth";

interface UserRow {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  created_at: Date;
}

const mapUser = (row: UserRow): AuthUser => ({
  id: row.id,
  name: row.name,
  email: row.email,
  createdAt: row.created_at.toISOString()
});

export class UsersRepository {
  async findByEmail(email: string): Promise<(AuthUser & { passwordHash: string }) | null> {
    const result = await pool.query<UserRow>(
      "SELECT id, name, email, password_hash, created_at FROM users WHERE email = $1 LIMIT 1",
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
      "SELECT id, name, email, password_hash, created_at FROM users WHERE id = $1 LIMIT 1",
      [id]
    );
    const row = result.rows[0];
    return row ? mapUser(row) : null;
  }

  async create(name: string, email: string, passwordHash: string): Promise<AuthUser> {
    const result = await pool.query<UserRow>(
      `INSERT INTO users (id, name, email, password_hash)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, password_hash, created_at`,
      [randomUUID(), name, email, passwordHash]
    );
    return mapUser(result.rows[0]);
  }
}
