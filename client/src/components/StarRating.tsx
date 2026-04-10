// Muestra una valoración de 0–5 con estrellas (solo lectura).

interface StarRatingProps {
  rating: number | undefined;
  className?: string;
}

export const StarRating = ({ rating, className = "" }: StarRatingProps) => {
  const full =
    rating == null || Number.isNaN(rating)
      ? 0
      : Math.max(0, Math.min(5, Math.round(rating)));
  const label =
    rating == null || Number.isNaN(rating)
      ? "Sin valorar"
      : `${rating} de 5 estrellas`;

  return (
    <span
      className={`inline-flex items-center gap-1 ${className}`}
      role="img"
      aria-label={label}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={
            i < full
              ? "text-amber-500 drop-shadow-sm dark:text-amber-400"
              : "text-slate-300 dark:text-slate-600"
          }
          aria-hidden
        >
          ★
        </span>
      ))}
    </span>
  );
};
