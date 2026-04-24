// Estado global de autenticación para login/registro/logout.
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  ApiError,
  authStorage,
  AuthUser,
  getMe,
  loginUser,
  registerUser,
  updateProfile as updateProfileRequest,
  type UpdateProfileBody
} from "../api/client";

const normalizeAuthUser = (raw: AuthUser): AuthUser => ({
  ...raw,
  lastName: typeof raw.lastName === "string" ? raw.lastName : "",
  avatarUrl: typeof raw.avatarUrl === "string" && raw.avatarUrl.trim() ? raw.avatarUrl.trim() : null
});

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (body: UpdateProfileBody) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      const token = authStorage.getToken();
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const me = await getMe();
        setUser(normalizeAuthUser(me));
      } catch {
        authStorage.clearToken();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    void bootstrap();
  }, []);

  const login = async (email: string, password: string) => {
    const auth = await loginUser(email, password);
    authStorage.setToken(auth.token);
    setUser(normalizeAuthUser(auth.user));
  };

  const register = async (name: string, email: string, password: string) => {
    const auth = await registerUser(name, email, password);
    authStorage.setToken(auth.token);
    setUser(normalizeAuthUser(auth.user));
  };

  const logout = () => {
    authStorage.clearToken();
    setUser(null);
  };

  const updateProfile = useCallback(async (body: UpdateProfileBody) => {
    const updated = await updateProfileRequest(body);
    setUser(normalizeAuthUser(updated));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      updateProfile
    }),
    [loading, updateProfile, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
};

export const isApiError = (error: unknown): error is ApiError => error instanceof ApiError;
