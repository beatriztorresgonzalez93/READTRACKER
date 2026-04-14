// Página de fallback 404 cuando la ruta no existe.
import { Link } from "react-router-dom";

export const NotFoundPage = () => {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
      <h1 className="rt-page-title text-4xl text-slate-900 dark:text-slate-100">404</h1>
      <p className="rt-body-copy mt-2 text-slate-600 dark:text-slate-300">La página que buscas no existe.</p>
      <Link to="/" className="rt-body-copy mt-4 inline-block font-medium text-cyan-700 hover:text-cyan-800">
        Volver a la biblioteca
      </Link>
    </section>
  );
};
