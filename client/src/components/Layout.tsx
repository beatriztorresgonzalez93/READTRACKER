// Layout base con navegación y selector de tema para todas las páginas.
import { ReactNode, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";

type Theme = "light" | "dark";

export const Layout = ({ children }: { children: ReactNode }) => {
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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#cffafe_0%,_#f8fafc_45%,_#f8fafc_100%)] dark:bg-[radial-gradient(circle_at_top,_#0891b2_0%,_#0f172a_45%,_#020617_100%)]">
      <header className="sticky top-0 z-20 border-b border-base-300/70 bg-base-100/85 backdrop-blur dark:border-cyan-900/40 dark:bg-slate-900/85">
        <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <Link to="/" className="inline-flex items-center gap-2 text-slate-900 dark:text-slate-100">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-cyan-600" aria-hidden="true" />
            <span className="text-xl font-bold tracking-tight">ReadTracker</span>
          </Link>
          <div className="flex flex-wrap items-center gap-2 text-sm font-medium">
            <Link
              to="/"
              className="inline-flex h-8 items-center rounded-md px-3 text-xs text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Biblioteca
            </Link>
            <Button variant="outline" size="sm" onClick={toggleTheme}>
              {theme === "dark" ? "Claro" : "Oscuro"}
            </Button>
          </div>
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
};
