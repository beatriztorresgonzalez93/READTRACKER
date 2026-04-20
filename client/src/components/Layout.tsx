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
    <div className="min-h-screen bg-[#a8d0df] dark:bg-[radial-gradient(circle_at_top,_#0891b2_0%,_#0f172a_45%,_#020617_100%)]">
      <header className="sticky top-0 z-20 border-b border-base-300/70 bg-base-100/85 backdrop-blur dark:border-cyan-900/40 dark:bg-slate-900/85">
        <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <Link to="/" className="inline-flex items-center gap-2 text-slate-900 dark:text-slate-100">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-cyan-600" aria-hidden="true" />
            <span className="rt-brand-mark text-xl">ReadTracker</span>
          </Link>
          <div className="flex flex-wrap items-center gap-2 text-sm font-medium">
            {!isAuthenticated && location.pathname !== "/login" && (
              <Link to="/login">
                <Button variant="outline" size="sm">
                  Entrar
                </Button>
              </Link>
            )}
            {!isAuthenticated && location.pathname !== "/register" && (
              <Link to="/register">
                <Button variant="ghost" size="sm">
                  Crear cuenta
                </Button>
              </Link>
            )}
            {isAuthenticated && user && (
              <span className="hidden font-['Fraunces',serif] text-lg font-semibold tracking-tight text-slate-800 dark:text-slate-100 sm:inline">
                Hola, {user.name}
              </span>
            )}
            {isAuthenticated && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={logout}
                className="cursor-pointer border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:border-rose-800/60 dark:bg-rose-950/40 dark:text-rose-200 dark:hover:bg-rose-900/50"
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
              aria-label={theme === "dark" ? "Activar modo claro" : "Activar modo oscuro"}
              title={theme === "dark" ? "Modo claro" : "Modo oscuro"}
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
};
