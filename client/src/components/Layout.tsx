// Layout base con navegación y selector de tema para todas las páginas.
import { ReactNode, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { LogOut, Moon, Sun } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Button } from "./ui/button";

type Theme = "light" | "dark";

export const Layout = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const isLibraryView = location.pathname === "/";
  const isReviewsView = location.pathname === "/reviews";
  const isWishlistView = location.pathname === "/wishlist";
  const isAuthView = location.pathname === "/login" || location.pathname === "/register";
  const isBookFormView = location.pathname === "/books/new" || /^\/books\/[^/]+\/edit$/.test(location.pathname);
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const saved = localStorage.getItem("readtracker-theme");
    const initial: Theme = saved === "light" ? "light" : "dark";
    setTheme(initial);
    document.documentElement.setAttribute("data-theme", initial === "dark" ? "night" : "light");
    document.documentElement.classList.toggle("dark", initial === "dark");
  }, []);

  const toggleTheme = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("readtracker-theme", next);
    document.documentElement.setAttribute("data-theme", next === "dark" ? "night" : "light");
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  return (
    <div
      className={
        isAuthView
          ? "min-h-screen bg-[#f2e6d3] dark:bg-[#2b130b]"
          : isLibraryView || isReviewsView || isWishlistView || isBookFormView
          ? "min-h-screen bg-[linear-gradient(180deg,#e3c6ab_0%,#ead2bc_44%,#f1dfcf_100%)] dark:bg-[linear-gradient(180deg,#3a170c_0%,#4a1f0f_42%,#54230f_100%)]"
          : "min-h-screen bg-[#d9e5df] dark:bg-[#1f2a26]"
      }
    >
      <header className="sticky top-0 z-20 border-y border-[#d5bca2]/85 bg-[#c8a98a]/90 text-[#fff7ef] shadow-[inset_0_1px_0_rgba(255,243,220,0.26)] backdrop-blur dark:border-[#9f6d3b]/80 dark:bg-[#2a120a]/95 dark:text-amber-100">
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
                className={`px-3 py-1 ${isLibraryView ? "rounded-sm border border-amber-400/75 bg-amber-950/25 dark:border-amber-500/75 dark:bg-amber-900/30" : ""}`}
              >
                Colección
              </Link>
              <Link
                to="/reviews"
                className={`px-3 py-1 ${isReviewsView ? "rounded-sm border border-amber-400/75 bg-amber-950/25 dark:border-amber-500/75 dark:bg-amber-900/30" : ""}`}
              >
                Reseñas
              </Link>
              <Link
                to="/wishlist"
                className={`px-3 py-1 ${isWishlistView ? "rounded-sm border border-amber-400/75 bg-amber-950/25 dark:border-amber-500/75 dark:bg-amber-900/30" : ""}`}
              >
                Lista de deseos
              </Link>
              <span className="px-3 py-1 opacity-80">Estadísticas</span>
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
            <Button
              variant="outline"
              size="icon-sm"
              onClick={toggleTheme}
              className="border-amber-600 bg-amber-900/20 text-amber-100 hover:bg-amber-900/35"
              aria-label={theme === "dark" ? "Activar modo claro" : "Activar modo oscuro"}
              title={theme === "dark" ? "Modo claro" : "Modo oscuro"}
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </nav>
      </header>
      <main
        className={
          isLibraryView || isReviewsView || isWishlistView || isAuthView
            ? "w-full min-h-[calc(100vh-72px)] px-0 py-5 sm:py-6"
            : "mx-auto max-w-6xl px-4 py-10 sm:px-6"
        }
      >
        {children}
      </main>
    </div>
  );
};
