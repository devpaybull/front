import type { ReactNode } from "react";

export function TableMessage({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-[15px] font-medium text-muted-foreground">
      {children}
    </div>
  );
}
