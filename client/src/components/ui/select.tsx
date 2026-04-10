// Select base reusable (estilo shadcn) para filtros y formularios.
import { forwardRef, SelectHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({ className, ...props }, ref) => {
  return (
    <select
      ref={ref}
      className={cn(
        "rounded-xl border border-[#a7bda9] bg-[#d5e2d3] px-3 py-2.5 text-sm text-[#1f3324] shadow-sm ring-1 ring-transparent transition hover:border-[#95af98] hover:bg-[#c7d8c5] focus:border-[#84a188] focus:bg-[#c7d8c5] focus:outline-none focus:ring-[#9eb79f] dark:border-[#6a8671] dark:bg-[#5f7a65] dark:text-[#eef5ec] dark:hover:border-[#76957e] dark:hover:bg-[#6a8671] dark:focus:border-[#86a78f] dark:focus:bg-[#6a8671] dark:focus:ring-[#8eaa95]",
        className
      )}
      {...props}
    />
  );
});

Select.displayName = "Select";
