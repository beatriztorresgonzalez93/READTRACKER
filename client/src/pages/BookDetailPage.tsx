// Mantener una única fuente de verdad del panel de detalle en LibraryPage.
// Esta ruta conserva compatibilidad: redirige al flujo preview.
import { Navigate, useParams } from "react-router-dom";

export const BookDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  return <Navigate to={id ? `/?preview=${encodeURIComponent(id)}` : "/"} replace />;
};
