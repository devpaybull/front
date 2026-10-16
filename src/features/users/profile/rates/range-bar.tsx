import { cn } from "cn";
import DangerIcon from "@/assets/icons/danger-circle.svg?react";
import { Tag } from "@/components/tag";
import { formatAmount } from "@/lib/format";
import type { BarSegment } from "./rates-draft";

const label = (from: number, to: number) =>
  `${formatAmount(String(from), "RUB")}-${formatAmount(String(to), "RUB")}`;

export function RangeBar({ segments }: { segments: BarSegment[] }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2.5">
        <Tag size="sm" dot tone="plain">
          Диапазон задан
        </Tag>
        <Tag size="sm" dot tone="orange">
          Пропуск
        </Tag>
        <Tag size="sm" dot tone="blue">
          Пересечение
        </Tag>
      </div>

      <div className="flex h-[43px] overflow-hidden rounded-[10px] text-[13px] leading-none font-semibold tracking-[-0.02em]">
        {segments.map((segment, index) =>
          segment.kind === "overlap" ? (
            <span
              // biome-ignore lint/suspicious/noArrayIndexKey: segments follow the ranges' order
              key={index}
              title="Пересечение"
              className="w-5 shrink-0 bg-[repeating-linear-gradient(-45deg,#4d88e2_0_3px,rgb(77_136_226/0.5)_3px_6px)]"
            />
          ) : (
            <span
              // biome-ignore lint/suspicious/noArrayIndexKey: segments follow the ranges' order
              key={index}
              className={cn(
                "flex min-w-0 flex-1 items-center justify-center gap-1.5 truncate border-r border-[#0c1014] px-2 last:border-r-0",
                segment.kind === "gap"
                  ? "bg-orange/10 text-orange"
                  : "bg-[#1b2127]/35",
              )}
            >
              {segment.kind === "gap" && (
                <DangerIcon className="size-4 shrink-0" />
              )}
              {label(segment.from, segment.to)}
            </span>
          ),
        )}
      </div>
    </div>
  );
}
