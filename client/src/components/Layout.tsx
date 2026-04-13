// Layout base con navegación y selector de tema para todas las páginas.
import { ReactNode, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";

type Theme = "light" | "dark";

export const Layout = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const saved = localStorage.getItem("readtracker-theme");
    const initial: Theme = saved === "dark" ? "dark" : "light";
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
    <div className="min-h-screen bg-[#e7eee7] dark:bg-[#1f2b25]">
      <header className="sticky top-0 z-20 border-b border-[#c7d5c4]/80 bg-[#eef4eb]/90 backdrop-blur dark:border-[#36493d]/85 dark:bg-[#1f2b25]/90">
        <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <Link to="/" className="inline-flex items-center gap-2 text-slate-900 dark:text-slate-100">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#5f7a65] dark:bg-[#7b9982]" aria-hidden="true" />
            <span className="text-xl font-bold tracking-tight">ReadTracker</span>
          </Link>
          <div className="flex flex-wrap items-center gap-2 text-sm font-medium">
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
