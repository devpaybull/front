import { area, curveMonotoneX, line } from "d3-shape";
import { motion } from "motion/react";
import { useId } from "react";
import { ChartFrame, TooltipLine } from "@/components/charts/chart-frame";
import { niceTicks } from "@/components/charts/nice-ticks";
import { formatDayMonth } from "@/lib/dates";
import type { DayPayInRates } from "../types";

const percent = (value: number) => `${value}%`;

export function PayInChart({ days }: { days: DayPayInRates[] }) {
  const ticks = niceTicks(
    Math.max(...days.flatMap((d) => [d.conversion, d.disputes])),
  );
  const top = ticks[ticks.length - 1];

  return (
    <ChartFrame
      ticks={ticks}
      formatTick={percent}
      labels={days.map((d) => formatDayMonth(d.date))}
      hoverLine
      axisGap={10}
      overlay={
        <motion.svg
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          viewBox={`0 0 ${days.length} 100`}
          preserveAspectRatio="none"
          className="absolute inset-0 size-full overflow-visible"
        >
          <Curve
            values={days.map((d) => d.conversion)}
            top={top}
            color="var(--color-green)"
          />
          <Curve
            values={days.map((d) => d.disputes)}
            top={top}
            color="var(--color-orange)"
          />
        </motion.svg>
      }
      renderTooltip={(i) => (
        <>
          <TooltipLine dot="bg-green">
            Конверсия: {percent(days[i].conversion)}
          </TooltipLine>
          <TooltipLine dot="bg-orange">
            Споры: {percent(days[i].disputes)}
          </TooltipLine>
        </>
      )}
    />
  );
}

type Point = [x: number, y: number];

const lineOf = line<Point>().curve(curveMonotoneX);
const areaOf = area<Point>()
  .x((p) => p[0])
  .y0(100)
  .y1((p) => p[1])
  .curve(curveMonotoneX);

function Curve({
  values,
  top,
  color,
}: {
  values: number[];
  top: number;
  color: string;
}) {
  const gradient = `fill-${useId().replace(/[^\w-]/g, "")}`;
  const y = (value: number) => 100 - (value / top) * 100;
  const points: Point[] = [
    [0, y(values[0])],
    ...values.map((value, i): Point => [i + 0.5, y(value)]),
    [values.length, y(values[values.length - 1])],
  ];

  return (
    <>
      <defs>
        <linearGradient id={gradient} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" style={{ stopColor: color, stopOpacity: 0.55 }} />
          <stop offset="100%" style={{ stopColor: color, stopOpacity: 0.04 }} />
        </linearGradient>
      </defs>
      <path d={areaOf(points) ?? ""} fill={`url(#${gradient})`} />
      <path
        d={lineOf(points) ?? ""}
        fill="none"
        style={{ stroke: color }}
        strokeWidth={3}
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </>
  );
}
