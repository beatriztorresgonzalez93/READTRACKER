// Estado global de autenticación para login/registro/logout (Firebase Auth + API `/auth/me`).
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile as updateFirebaseProfile,
  onAuthStateChanged
} from "firebase/auth";
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  ApiError,
  authStorage,
  AuthUser,
  getMe,
  updateProfile as updateProfileRequest,
  type UpdateProfileBody
} from "../api/client";
import { firebaseAuth } from "../firebase/app";
import { mapFirebaseAuthError } from "../firebase/authErrors";

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
    const unsub = onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
      if (!firebaseUser) {
        authStorage.clearToken();
        setUser(null);
        setLoading(false);
        return;
      }
      try {
        const token = await firebaseUser.getIdToken();
        authStorage.setToken(token);
        const me = await getMe();
        setUser(normalizeAuthUser(me));
      } catch {
        authStorage.clearToken();
        setUser(null);
        await signOut(firebaseAuth).catch(() => undefined);
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const cred = await signInWithEmailAndPassword(firebaseAuth, email, password);
      const token = await cred.user.getIdToken();
      authStorage.setToken(token);
      const me = await getMe();
      setUser(normalizeAuthUser(me));
    } catch (err) {
      if (err instanceof ApiError) throw err;
      throw new Error(mapFirebaseAuthError(err));
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const cred = await createUserWithEmailAndPassword(firebaseAuth, email, password);
      const trimmed = name.trim();
      if (trimmed) {
        await updateFirebaseProfile(cred.user, { displayName: trimmed });
      }
      const token = await cred.user.getIdToken();
      authStorage.setToken(token);
      const me = await getMe();
      setUser(normalizeAuthUser(me));
    } catch (err) {
      if (err instanceof ApiError) throw err;
      throw new Error(mapFirebaseAuthError(err));
    }
  };

  const logout = () => {
    void signOut(firebaseAuth);
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
