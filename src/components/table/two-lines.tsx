import type { ReactNode } from "react";

export function TwoLines({ main, sub }: { main: ReactNode; sub: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span>{main}</span>
      <span className="text-[13px] text-muted-foreground">{sub}</span>
    </div>
  );
}
