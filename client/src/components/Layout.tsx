// Layout base con navegación y selector de tema para todas las páginas.
import { ReactNode, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { LogOut, Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Button } from "./ui/button";

export const Layout = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const modalState = location.state as { backgroundLocation?: { pathname?: string } } | null;
  const activePathname = modalState?.backgroundLocation?.pathname ?? location.pathname;
  const isLibraryView = activePathname === "/";
  const isHistoryView = activePathname === "/history";
  const isReviewsView = activePathname === "/reviews";
  const isWishlistView = activePathname === "/wishlist";
  const isStatsView = activePathname === "/stats";
  const isAuthView = activePathname === "/login" || activePathname === "/register";
  const isBookFormView = activePathname === "/books/new" || /^\/books\/[^/]+\/edit$/.test(activePathname);
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "night");
    document.documentElement.classList.add("dark");
    localStorage.setItem("readtracker-theme", "dark");
  }, []);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileNavOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileNavOpen]);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileNavOpen]);

  const navLinkClass = (active: boolean) =>
    `px-3 py-1 ${active ? "rounded-sm border border-amber-500/75 bg-amber-900/30" : ""}`;

  const mobileNavLinkClass = (active: boolean) =>
    `block border-b border-amber-800/40 px-4 py-3 text-[0.85rem] font-semibold tracking-[0.06em] text-amber-100/95 last:border-b-0 ${
      active ? "bg-amber-900/35 text-amber-50" : "hover:bg-amber-950/40"
    }`;

  return (
    <div
      className={
        isAuthView
          ? "min-h-screen bg-[#2b130b]"
          : isLibraryView || isHistoryView || isReviewsView || isWishlistView || isStatsView || isBookFormView
          ? "min-h-screen bg-[#6a422d]"
          : "min-h-screen bg-[#2b130b]"
      }
    >
      <header className="sticky top-0 z-20 border-y border-[#d7b06f] bg-[#1a0b06]/96 text-amber-100 shadow-[inset_0_1px_0_rgba(255,243,220,0.26)] backdrop-blur relative">
        <nav className="mx-auto grid w-full grid-cols-[auto_1fr_auto] items-center gap-2 px-3 py-3 sm:gap-3 sm:px-6 md:grid-cols-[1fr_auto_1fr] md:gap-4">
          <Link to="/" className="inline-flex justify-self-start flex-col text-amber-100">
            <span className="font-['Fraunces',serif] text-[1.55rem] leading-none tracking-[0.02em] text-[#f6ead8] drop-shadow-[0_1px_0_rgba(0,0,0,0.35)] sm:text-[2.15rem]">
              Script<span className="italic text-[#e6bf74]">orium</span>
            </span>
            <span className="mt-1 hidden text-[0.66rem] font-semibold tracking-[0.32em] text-[#c89c33] sm:inline">
              ✦ BIBLIOTECA PERSONAL ✦
            </span>
          </Link>
          <div className="flex justify-center">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="shrink-0 border border-amber-600/60 bg-amber-950/40 text-amber-100 hover:bg-amber-900/45 md:hidden"
              aria-expanded={mobileNavOpen}
              aria-controls="mobile-main-nav"
              aria-label={mobileNavOpen ? "Cerrar menú de navegación" : "Abrir menú de navegación"}
              onClick={() => setMobileNavOpen((open) => !open)}
            >
              {mobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <div className="hidden justify-center md:flex">
              <div className="flex flex-wrap items-center justify-center gap-1 text-[0.73rem] font-semibold tracking-[0.08em] text-amber-100/85">
                <Link to="/" className={navLinkClass(isLibraryView)}>
                  Colección
                </Link>
                <Link to="/reviews" className={navLinkClass(isReviewsView)}>
                  Reseñas
                </Link>
                <Link to="/wishlist" className={navLinkClass(isWishlistView)}>
                  Lista de deseos
                </Link>
                <Link to="/stats" className={navLinkClass(isStatsView)}>
                  Estadísticas
                </Link>
                <Link to="/history" className={navLinkClass(isHistoryView)}>
                  Historial
                </Link>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-self-end justify-end gap-1.5 text-xs font-medium sm:gap-2.5 sm:text-sm">
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
        {mobileNavOpen && (
          <div
            id="mobile-main-nav"
            className="absolute inset-x-0 top-full z-30 border-b border-[#d7b06f] bg-[#1a0b06]/98 shadow-lg backdrop-blur md:hidden"
            role="navigation"
            aria-label="Navegación principal"
          >
            <div className="mx-auto max-h-[min(70vh,calc(100dvh-4rem))] overflow-y-auto py-1">
              <Link to="/" className={mobileNavLinkClass(isLibraryView)} onClick={() => setMobileNavOpen(false)}>
                Colección
              </Link>
              <Link to="/reviews" className={mobileNavLinkClass(isReviewsView)} onClick={() => setMobileNavOpen(false)}>
                Reseñas
              </Link>
              <Link to="/wishlist" className={mobileNavLinkClass(isWishlistView)} onClick={() => setMobileNavOpen(false)}>
                Lista de deseos
              </Link>
              <Link to="/stats" className={mobileNavLinkClass(isStatsView)} onClick={() => setMobileNavOpen(false)}>
                Estadísticas
              </Link>
              <Link to="/history" className={mobileNavLinkClass(isHistoryView)} onClick={() => setMobileNavOpen(false)}>
                Historial
              </Link>
            </div>
          </div>
        )}
      </header>
      {mobileNavOpen && (
        <div
          className="fixed inset-0 z-10 bg-black/55 backdrop-blur-[1px] md:hidden"
          aria-hidden="true"
          onClick={() => setMobileNavOpen(false)}
        />
      )}
      <main
        className={`relative z-0 ${
          isLibraryView || isHistoryView || isReviewsView || isWishlistView || isStatsView || isAuthView
            ? "w-full min-h-[calc(100vh-72px)] px-0 py-5 sm:py-6"
            : "mx-auto max-w-6xl px-4 py-10 sm:px-6"
        }`}
      >
        {children}
      </main>
    </div>
  );
};
