import { cn } from "cn";
import type { ComponentProps, ReactNode } from "react";
import { TwoLines } from "@/components/table/two-lines";

const tones = {
  green: { tile: "bg-green/10 text-green", hover: "hover:bg-green/20" },
  orange: { tile: "bg-orange/10 text-orange", hover: "hover:bg-orange/20" },
  blue: { tile: "bg-blue/10 text-blue", hover: "hover:bg-blue/20" },
  red: {
    tile: "bg-destructive/10 text-destructive",
    hover: "hover:bg-destructive/20",
  },
  primary: { tile: "bg-primary/10 text-primary", hover: "hover:bg-primary/20" },
  telegram: { tile: "bg-[#26a4e3]/10", hover: "hover:bg-[#26a4e3]/20" },
  light: { tile: "bg-foreground/10", hover: "hover:bg-foreground/20" },
  muted: {
    tile: "bg-[#1b2127]/60 text-foreground/60",
    hover: "hover:bg-[#1b2127]",
  },
};

export type IconTileTone = keyof typeof tones;

export function IconTile({
  tone,
  hoverable = false,
  className,
  ...props
}: ComponentProps<"span"> & {
  tone: IconTileTone;
  hoverable?: boolean;
}) {
  return (
    <span
      className={cn(
        "grid size-[31px] shrink-0 place-items-center rounded-[8px] transition-colors [&_svg:not([class*='size-'])]:size-5",
        tones[tone].tile,
        hoverable && tones[tone].hover,
        className,
      )}
      {...props}
    />
  );
}

export function IconCell({
  tile,
  main,
  sub,
  className,
}: {
  tile: ReactNode;
  main: ReactNode;
  sub?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex min-w-0 items-center gap-2", className)}>
      {tile}
      {sub === undefined ? (
        <span className="min-w-0">{main}</span>
      ) : (
        <TwoLines main={main} sub={sub} />
      )}
    </div>
  );
}
