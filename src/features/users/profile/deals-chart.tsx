import { cn } from "cn";
import { ChartFrame, TooltipLine } from "@/components/charts/chart-frame";
import { niceTicks } from "@/components/charts/nice-ticks";
import { formatDayMonth } from "@/lib/dates";
import type { DayDeals } from "../types";

export function DealsChart({ days }: { days: DayDeals[] }) {
  const totals = days.map((d) => d.success + d.fail + d.dispute);
  const ticks = niceTicks(Math.max(...totals));
  const top = ticks[ticks.length - 1];

  return (
    <ChartFrame
      ticks={ticks}
      labels={days.map((d) => formatDayMonth(d.date))}
      columnWidth={43}
      barHeight={(i) => totals[i] / top}
      renderBars={(i) => {
        const day = days[i];
        const total = totals[i] || 1;
        return (
          <div className="relative h-full w-[26px]">
            <Part className="bg-amber" share={1} />
            <Part
              className="bg-destructive"
              share={(day.success + day.fail) / total}
            />
            <Part className="bg-green" share={day.success / total} />
          </div>
        );
      }}
      renderTooltip={(i) => (
        <>
          <TooltipLine dot="bg-green">Успешные: {days[i].success}</TooltipLine>
          <TooltipLine dot="bg-amber">Спор: {days[i].dispute}</TooltipLine>
          <TooltipLine dot="bg-destructive">Фейлы: {days[i].fail}</TooltipLine>
        </>
      )}
    />
  );
}

function Part({ className, share }: { className: string; share: number }) {
  return (
    <span
      className={cn("absolute inset-x-0 bottom-0 rounded-[6px]", className)}
      style={{ height: `${share * 100}%` }}
    />
  );
}
