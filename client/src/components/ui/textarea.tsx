// Textarea base reusable (estilo shadcn) para campos de texto largo.
import { forwardRef, TextareaHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "w-full rounded-xl border border-[#a7bda9] bg-[#d5e2d3] px-3 py-2 text-sm text-[#1f3324] shadow-sm ring-1 ring-transparent transition placeholder:text-[#5e7562] hover:border-[#95af98] hover:bg-[#c7d8c5] focus:border-[#84a188] focus:bg-[#c7d8c5] focus:outline-none focus:ring-[#9eb79f] dark:border-[#4a5f52] dark:bg-[#26352d] dark:text-[#e3eee1] dark:placeholder:text-[#9fb39e] dark:hover:border-[#5e7663] dark:hover:bg-[#2b3a31] dark:focus:border-[#6f8b75] dark:focus:bg-[#2b3a31] dark:focus:ring-[#5e7663]",
          className
        )}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";
