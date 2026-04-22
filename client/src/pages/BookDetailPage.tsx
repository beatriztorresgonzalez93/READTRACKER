// Redirige el detalle clásico a la biblioteca con panel lateral abierto.
import { Navigate, useParams } from "react-router-dom";

export const BookDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  return <Navigate to={id ? `/?preview=${encodeURIComponent(id)}` : "/"} replace />;
};
