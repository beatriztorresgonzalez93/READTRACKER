// Layout base con navegación y selector de tema para todas las páginas.
import { ReactNode, useEffect, useState } from "react";
import { Link } from "react-router-dom";

type Theme = "light" | "dark";

export const Layout = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const saved = localStorage.getItem("readtracker-theme");
    const initial: Theme = saved === "light" ? "light" : "dark";
    setTheme(initial);
    document.documentElement.classList.toggle("dark", initial === "dark");
  }, []);

  const toggleTheme = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("readtracker-theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#e0e7ff_0%,_#f8fafc_45%,_#f8fafc_100%)] dark:bg-[radial-gradient(circle_at_top,_#312e81_0%,_#0f172a_45%,_#020617_100%)]">
      <header className="sticky top-0 z-20 border-b border-indigo-100/70 bg-white/85 backdrop-blur dark:border-indigo-900/40 dark:bg-slate-900/85">
        <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <Link to="/" className="bg-gradient-to-r from-indigo-600 to-fuchsia-500 bg-clip-text text-xl font-extrabold tracking-tight text-transparent">
            ReadTracker
          </Link>
          <div className="flex flex-wrap items-center gap-2 text-sm font-medium">
            <Link to="/" className="rounded-md px-3 py-1.5 text-slate-700 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100">
              Biblioteca
            </Link>
            <Link to="/books/new" className="rounded-md bg-indigo-600 px-3 py-1.5 text-white transition hover:bg-indigo-500">
              Añadir libro
            </Link>
            <button
              type="button"
              onClick={toggleTheme}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              {theme === "dark" ? "Claro" : "Oscuro"}
            </button>
          </div>
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
};
