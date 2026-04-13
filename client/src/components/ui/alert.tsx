// Alert reusable para mensajes de estado (error/info) en la UI.
import { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const alertVariants = cva(
  "rounded-xl border px-4 py-3 text-sm",
  {
    variants: {
      variant: {
        default: "border-slate-200 bg-slate-50 text-slate-800 dark:border-[#4a5f52] dark:bg-[#26352d]/75 dark:text-slate-100",
        destructive:
          "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-200"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

type AlertProps = HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>;

export const Alert = ({ className, variant, ...props }: AlertProps) => (
  <div role="alert" className={cn(alertVariants({ variant }), className)} {...props} />
);
