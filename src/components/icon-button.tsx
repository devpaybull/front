import { cn } from "cn";
import type { ComponentProps } from "react";

export function IconButton({
  label,
  size = "md",
  className,
  ...props
}: ComponentProps<"button"> & {
  label: string;
  size?: "md" | "lg";
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        "grid shrink-0 place-items-center border border-border bg-card text-foreground/60 outline-none transition-colors hover:bg-primary/10 hover:text-primary focus-visible:ring-2 focus-visible:ring-ring",
        size === "md"
          ? "size-8 rounded-[8px] [&_svg:not([class*='size-'])]:size-4"
          : "size-11 rounded-[10px] text-foreground [&_svg:not([class*='size-'])]:size-5",
        className,
      )}
      {...props}
    />
  );
}
