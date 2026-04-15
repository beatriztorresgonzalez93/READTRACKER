// Tipos compartidos del dominio de autenticación.
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResult {
  token: string;
  user: AuthUser;
}
