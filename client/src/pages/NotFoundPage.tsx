// Página de fallback 404 cuando la ruta no existe.
import { Link } from "react-router-dom";

export const NotFoundPage = () => {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-[#3d5346] dark:bg-[#233229]">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">404</h1>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">La página que buscas no existe.</p>
      <Link to="/" className="mt-4 inline-block text-sm font-medium text-[#45634b] hover:text-[#36513c] dark:text-[#b8ccb9] dark:hover:text-[#d7e7d5]">
        Volver a la biblioteca
      </Link>
    </section>
  );
};
