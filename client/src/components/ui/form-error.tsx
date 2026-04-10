// Mensaje de error reutilizable para validaciones de formularios.
import { HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export const FormError = ({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn("mt-1 text-xs text-red-600", className)} {...props} />
);
