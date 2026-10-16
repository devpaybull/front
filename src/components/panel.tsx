import { cn } from "cn";
import type { ComponentProps } from "react";

export function Panel({ className, ...props }: ComponentProps<"section">) {
  return (
    <section
      className={cn("rounded-2xl border border-border/80 bg-panel", className)}
      {...props}
    />
  );
}
