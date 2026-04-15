// Lógica de negocio para registro/login y perfil del usuario autenticado.
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { UsersRepository } from "../repositories/usersRepository";
import { AuthResult, AuthUser, LoginDto, RegisterDto } from "../types/auth";

const TOKEN_EXPIRES_IN = "7d";

export class AuthService {
  constructor(private readonly usersRepository: UsersRepository) {}

  private signToken(user: AuthUser): string {
    return jwt.sign({ sub: user.id, email: user.email }, env.jwtSecret, {
      expiresIn: TOKEN_EXPIRES_IN
    });
  }

  async register(data: RegisterDto): Promise<AuthResult> {
    const email = data.email.trim().toLowerCase();
    const existing = await this.usersRepository.findByEmail(email);
    if (existing) {
      throw new Error("Ya existe una cuenta con ese email");
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await this.usersRepository.create(data.name.trim(), email, passwordHash);
    return {
      token: this.signToken(user),
      user
    };
  }

  async login(data: LoginDto): Promise<AuthResult> {
    const email = data.email.trim().toLowerCase();
    const user = await this.usersRepository.findByEmail(email);
    if (!user) {
      throw new Error("Email o contraseña incorrectos");
    }

    const isValid = await bcrypt.compare(data.password, user.passwordHash);
    if (!isValid) {
      throw new Error("Email o contraseña incorrectos");
    }

    const { passwordHash: _passwordHash, ...safeUser } = user;
    return {
      token: this.signToken(safeUser),
      user: safeUser
    };
  }

  async getProfile(userId: string): Promise<AuthUser | null> {
    return this.usersRepository.findById(userId);
  }
}
