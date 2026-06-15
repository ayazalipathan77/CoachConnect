import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

/* ----------------------------- Card ----------------------------- */
export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-cc-lg border border-border bg-surface p-5 transition-colors",
        className,
      )}
      {...props}
    />
  );
}

/* ---------------------------- Badge ----------------------------- */
const badge = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
  {
    variants: {
      tone: {
        volt: "bg-volt/15 text-volt border border-volt/30",
        neutral: "bg-surface-2 text-fg-muted border border-border",
        success: "bg-success/15 text-success border border-success/30",
        warning: "bg-warning/15 text-warning border border-warning/30",
        danger: "bg-danger/15 text-danger border border-danger/30",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

export function Badge({
  className,
  tone,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badge>) {
  return <span className={cn(badge({ tone }), className)} {...props} />;
}

/* ---------------------------- Input ----------------------------- */
export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "cc-ring h-11 w-full rounded-cc border border-border bg-bg-elev px-4 text-sm text-fg",
      "placeholder:text-fg-subtle focus:border-volt-deep transition-colors",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";

/* -------------------------- Textarea ---------------------------- */
export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "cc-ring min-h-[96px] w-full rounded-cc border border-border bg-bg-elev px-4 py-3 text-sm text-fg",
      "placeholder:text-fg-subtle focus:border-volt-deep transition-colors resize-y",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";

/* ---------------------------- Label ----------------------------- */
export function Label({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("mb-1.5 block text-sm font-medium text-fg-muted", className)}
      {...props}
    />
  );
}
