import { cn } from "cn";
import type { ReactNode } from "react";

const tones = {
  green: { badge: "bg-[#81e24d]/10 text-green", dot: "bg-green" },
  blue: { badge: "bg-blue/10 text-blue", dot: "bg-blue" },
  orange: { badge: "bg-orange/10 text-orange", dot: "bg-orange" },
  red: { badge: "bg-destructive/10 text-destructive", dot: "bg-destructive" },
  primary: { badge: "bg-primary/10 text-primary", dot: "bg-primary" },
  neutral: {
    badge: "bg-foreground/10 text-foreground/60",
    dot: "bg-foreground/60",
  },
};

export type StatusTone = keyof typeof tones;

export function StatusBadge({
  tone,
  children,
}: {
  tone: StatusTone;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1.5 rounded-[10px] px-3.5 py-2 text-[15px] leading-none font-semibold tracking-[-0.02em]",
        tones[tone].badge,
      )}
    >
      <span
        aria-hidden
        className={cn("size-[7px] rounded-[2px]", tones[tone].dot)}
      />
      {children}
    </span>
  );
}
