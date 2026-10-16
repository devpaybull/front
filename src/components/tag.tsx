import { cn } from "cn";
import type { ReactNode } from "react";

const tones = {
  green: { tag: "bg-[#81e24d]/10 text-green", dot: "bg-green" },
  blue: { tag: "bg-blue/15 text-blue", dot: "bg-blue" },
  orange: { tag: "bg-orange/10 text-orange", dot: "bg-orange" },
  amber: { tag: "bg-amber/10 text-amber", dot: "bg-amber" },
  red: { tag: "bg-destructive/10 text-destructive", dot: "bg-destructive" },
  primary: { tag: "bg-primary/10 text-primary", dot: "bg-primary" },
  plain: { tag: "bg-[#1b2127]/60 text-foreground", dot: "bg-foreground" },
  neutral: {
    tag: "bg-[#1b2127]/60 text-foreground/60",
    dot: "bg-foreground/60",
  },
};

export type TagTone = keyof typeof tones;

export function Tag({
  tone,
  dot = false,
  size = "md",
  children,
}: {
  tone: TagTone;
  dot?: boolean;
  size?: "md" | "sm";
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-[25px] w-fit shrink-0 items-center gap-1.5 rounded-[8px] px-2 leading-none font-semibold tracking-[-0.02em] whitespace-nowrap",
        size === "md" ? "text-[15px]" : "text-[13px]",
        tones[tone].tag,
      )}
    >
      {dot && (
        <span
          aria-hidden
          className={cn("size-[7px] rounded-[2px]", tones[tone].dot)}
        />
      )}
      {children}
    </span>
  );
}
