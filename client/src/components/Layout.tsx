// Layout base con navegación y selector de tema para todas las páginas.
import { ReactNode, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Button } from "./ui/button";

export const Layout = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const isLibraryView = location.pathname === "/";
  const isReviewsView = location.pathname === "/reviews";
  const isWishlistView = location.pathname === "/wishlist";
  const isStatsView = location.pathname === "/stats";
  const isAuthView = location.pathname === "/login" || location.pathname === "/register";
  const isBookFormView = location.pathname === "/books/new" || /^\/books\/[^/]+\/edit$/.test(location.pathname);
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "night");
    document.documentElement.classList.add("dark");
    localStorage.setItem("readtracker-theme", "dark");
  }, []);

  return (
    <div
      className={
        isAuthView
          ? "min-h-screen bg-[#2b130b]"
          : isLibraryView || isReviewsView || isWishlistView || isStatsView || isBookFormView
          ? "min-h-screen bg-[#6a422d]"
          : "min-h-screen bg-[#2b130b]"
      }
    >
      <header className="sticky top-0 z-20 border-y border-[#d7b06f] bg-[#1a0b06]/96 text-amber-100 shadow-[inset_0_1px_0_rgba(255,243,220,0.26)] backdrop-blur">
        <nav className="mx-auto grid w-full grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 py-3 sm:px-6">
          <Link to="/" className="inline-flex justify-self-start flex-col text-amber-100">
            <span className="font-['Fraunces',serif] text-[2.15rem] leading-none tracking-[0.02em] text-[#f6ead8] drop-shadow-[0_1px_0_rgba(0,0,0,0.35)]">
              Script<span className="italic text-[#e6bf74]">orium</span>
            </span>
            <span className="mt-1 text-[0.66rem] font-semibold tracking-[0.32em] text-[#c89c33]">
              ✦ BIBLIOTECA PERSONAL ✦
            </span>
          </Link>
          <div className="hidden justify-center md:flex">
            <div className="flex items-center gap-1 text-[0.73rem] font-semibold tracking-[0.08em] text-amber-100/85">
              <Link
                to="/"
                className={`px-3 py-1 ${isLibraryView ? "rounded-sm border border-amber-500/75 bg-amber-900/30" : ""}`}
              >
                Colección
              </Link>
              <Link
                to="/reviews"
                className={`px-3 py-1 ${isReviewsView ? "rounded-sm border border-amber-500/75 bg-amber-900/30" : ""}`}
              >
                Reseñas
              </Link>
              <Link
                to="/wishlist"
                className={`px-3 py-1 ${isWishlistView ? "rounded-sm border border-amber-500/75 bg-amber-900/30" : ""}`}
              >
                Lista de deseos
              </Link>
              <Link
                to="/stats"
                className={`px-3 py-1 ${isStatsView ? "rounded-sm border border-amber-500/75 bg-amber-900/30" : ""}`}
              >
                Estadísticas
              </Link>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-self-end justify-end gap-2.5 text-sm font-medium">
            {!isAuthenticated && location.pathname !== "/login" && (
              <Link to="/login">
                <Button variant="outline" size="sm" className="border-amber-600 bg-amber-900/20 font-semibold text-amber-100 hover:bg-amber-900/35">
                  Entrar
                </Button>
              </Link>
            )}
            {!isAuthenticated && location.pathname !== "/register" && (
              <Link to="/register">
                <Button variant="ghost" size="sm" className="font-semibold text-amber-100 hover:bg-amber-900/25">
                  Crear cuenta
                </Button>
              </Link>
            )}
            {isAuthenticated && user && (
              <span className="hidden font-['Fraunces',serif] text-lg font-semibold tracking-tight text-amber-100 sm:inline">
                Hola, {user.name}
              </span>
            )}
            {isAuthenticated && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={logout}
                className="cursor-pointer border border-rose-300/70 bg-rose-950/30 text-rose-100 hover:bg-rose-900/50"
                aria-label="Cerrar sesión"
                title="Cerrar sesión"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            )}
          </div>
        </nav>
      </header>
      <main
        className={
          isLibraryView || isReviewsView || isWishlistView || isStatsView || isAuthView
            ? "w-full min-h-[calc(100vh-72px)] px-0 py-5 sm:py-6"
            : "mx-auto max-w-6xl px-4 py-10 sm:px-6"
        }
      >
        {children}
      </main>
    </div>
  );
};
