// Botón base reusable (estilo shadcn) con variantes visuales.
import { cva, type VariantProps } from "class-variance-authority";
import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6b866f] disabled:pointer-events-none disabled:opacity-60",
  {
    variants: {
      variant: {
        default: "bg-[#5f7a65] text-white hover:bg-[#526b58] dark:bg-[#6a8671] dark:hover:bg-[#77957f]",
        outline:
          "border border-[#b7c8b4] bg-[#f4f8f2] text-[#2e4433] hover:bg-[#e8f0e5] dark:border-[#4a5f52] dark:bg-[#26352d] dark:text-[#d7e4d4] dark:hover:bg-[#314238]",
        ghost:
          "text-[#344a38] hover:bg-[#e8f0e5] dark:text-[#d1decf] dark:hover:bg-[#2f4036]",
        destructive:
          "bg-rose-600 text-white hover:bg-rose-500 dark:bg-rose-600 dark:hover:bg-rose-500"
      },
      size: {
        sm: "h-8 px-3 text-xs",
        default: "h-9 px-4",
        icon: "h-8 w-8"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = "button", ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
