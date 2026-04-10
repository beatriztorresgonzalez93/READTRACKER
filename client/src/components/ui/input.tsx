// Input base reusable (estilo shadcn) para formularios.
import { forwardRef, InputHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm ring-1 ring-transparent transition placeholder:text-slate-400 focus:border-slate-300 focus:outline-none focus:ring-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:border-slate-600 dark:focus:ring-slate-600",
        className
      )}
      {...props}
    />
  );
});

Input.displayName = "Input";
