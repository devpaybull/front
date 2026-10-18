import type { ReactNode } from "react";
import { Panel } from "./panel";

export function StatCard({
  tile,
  label,
  value,
  note,
}: {
  tile: ReactNode;
  label: string;
  value: ReactNode;
  note: ReactNode;
}) {
  return (
    <Panel className="flex h-[71px] items-center justify-between gap-4 px-5 leading-none font-semibold tracking-[-0.02em]">
      <div className="flex min-w-0 items-center gap-3.5">
        {tile}
        <div className="flex min-w-0 flex-col gap-1">
          <span className="text-[13px] text-[#8f8f9a]">{label}</span>
          <span className="truncate text-[19px] font-bold">{value}</span>
        </div>
      </div>
      <p className="shrink-0 text-right text-[13px] whitespace-nowrap text-[#8f8f9a]">
        {note}
      </p>
    </Panel>
  );
}

export const StatValue = ({ children }: { children: ReactNode }) => (
  <span className="text-foreground">{children}</span>
);

export const SuccessRate = ({ rate }: { rate: number }) => (
  <span className={rate >= 80 ? "text-green" : "text-orange"}>({rate}%)</span>
);
