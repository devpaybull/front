import { cn } from "cn";
import type { ReactNode } from "react";

export function Chip({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[10px] bg-[#1b2127]/80 px-3.5 py-2 text-[15px] leading-none font-semibold tracking-[-0.02em] text-foreground",
        className,
      )}
    >
      {children}
    </span>
  );
}
