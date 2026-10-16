import { ChartFrame, TooltipLine } from "@/components/charts/chart-frame";
import { niceTicks } from "@/components/charts/nice-ticks";
import { formatDayMonth } from "@/lib/dates";
import type { DayVolume } from "../types";

const thousands = (value: number) =>
  value === 0 ? "0" : `${Math.round(value / 1000)}k.`;

export function VolumeChart({ days }: { days: DayVolume[] }) {
  const highest = days.map((d) => Math.max(d.payIn, d.payOut));
  const ticks = niceTicks(Math.max(...highest));
  const top = ticks[ticks.length - 1];

  return (
    <ChartFrame
      ticks={ticks}
      formatTick={thousands}
      labels={days.map((d) => formatDayMonth(d.date))}
      columnWidth={43}
      barHeight={(i) => highest[i] / top}
      renderBars={(i) => {
        const pair = highest[i] || 1;
        const height = (value: number) => ({
          height: `${(value / pair) * 100}%`,
        });
        return (
          <div className="flex h-full items-end gap-px">
            <span
              className="w-[14px] rounded-[6px] bg-primary"
              style={height(days[i].payIn)}
            />
            <span
              className="w-[14px] rounded-[6px] bg-blue"
              style={height(days[i].payOut)}
            />
          </div>
        );
      }}
      renderTooltip={(i) => (
        <>
          <TooltipLine dot="bg-primary">
            Pay-in: {thousands(days[i].payIn)}
          </TooltipLine>
          <TooltipLine dot="bg-blue">
            Pay-out: {thousands(days[i].payOut)}
          </TooltipLine>
        </>
      )}
    />
  );
}
