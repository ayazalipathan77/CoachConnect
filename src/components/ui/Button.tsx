"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";

const button = cva(
  "cc-ring inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-cc font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        primary:
          "bg-volt text-black hover:bg-[#d8ff33] shadow-[0_0_0_0_var(--cc-volt-glow)] hover:shadow-[0_8px_30px_-6px_var(--cc-volt-glow)]",
        secondary:
          "bg-surface-2 text-fg border border-border-strong hover:border-volt-deep hover:bg-surface",
        ghost: "text-fg-muted hover:text-fg hover:bg-surface-2",
        outline:
          "border border-volt text-volt hover:bg-volt hover:text-black",
        danger: "bg-danger text-white hover:opacity-90",
      },
      size: {
        sm: "h-9 px-3.5 text-sm",
        md: "h-11 px-5 text-sm",
        lg: "h-13 px-7 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof button> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    const reduce = useReducedMotion();
    return (
      <motion.button
        ref={ref}
        className={cn(button({ variant, size }), className)}
        whileTap={reduce ? undefined : { scale: 0.97 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        {...(props as React.ComponentProps<typeof motion.button>)}
      />
    );
  },
);
Button.displayName = "Button";

export { button as buttonVariants };
