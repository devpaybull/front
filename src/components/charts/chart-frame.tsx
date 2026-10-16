import { cn } from "cn";
import { motion } from "motion/react";
import { type ReactNode, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const PLOT_HEIGHT = 152;

type ChartFrameProps = {
  ticks: number[];
  formatTick?: (value: number) => string;
  labels: string[];
  columnWidth?: number;
  barHeight?: (index: number) => number;
  renderBars?: (index: number) => ReactNode;
  renderTooltip: (index: number) => ReactNode;
  overlay?: ReactNode;
  hoverLine?: boolean;
  axisGap?: number;
};

export function ChartFrame({
  ticks,
  formatTick = String,
  labels,
  columnWidth,
  barHeight,
  renderBars,
  renderTooltip,
  overlay,
  hoverLine = false,
  axisGap = 7,
}: ChartFrameProps) {
  const at = (i: number) => `${(1 - i / (ticks.length - 1)) * 100}%`;
  const widest = ticks
    .map(formatTick)
    .reduce((a, b) => (b.length > a.length ? b : a));

  const columns = (
    <div
      className="relative"
      style={columnWidth ? { width: labels.length * columnWidth } : undefined}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0"
        style={{ height: PLOT_HEIGHT }}
      >
        {ticks.map((tick, i) => (
          <span
            key={tick}
            className="absolute inset-x-0 border-t border-dashed border-border"
            style={{ top: at(i) }}
          />
        ))}
        {overlay}
      </div>
      <div className="relative flex">
        {labels.map((label, i) => (
          <ChartColumn
            key={label}
            index={i}
            label={label}
            width={columnWidth}
            barHeight={barHeight?.(i)}
            bars={renderBars?.(i)}
            tooltip={renderTooltip(i)}
            hoverLine={hoverLine}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex text-[13px] leading-none font-medium tracking-[-0.02em] text-muted-foreground">
      <div
        className="relative shrink-0 text-right"
        style={{ height: PLOT_HEIGHT, marginRight: axisGap }}
      >
        <span className="invisible">{widest}</span>
        {ticks.map((tick, i) => (
          <span
            key={tick}
            className="absolute right-0 -translate-y-[calc(50%+4.5px)]"
            style={{ top: at(i) }}
          >
            {formatTick(tick)}
          </span>
        ))}
      </div>

      {columnWidth ? (
        <ScrollArea
          orientation="horizontal"
          className="-mr-[27px] min-w-0 flex-1"
        >
          <div className="w-max pr-[27px] pb-3">{columns}</div>
        </ScrollArea>
      ) : (
        <div className="min-w-0 flex-1 pb-3">{columns}</div>
      )}
    </div>
  );
}

type ChartColumnProps = {
  index: number;
  label: string;
  width?: number;
  barHeight?: number;
  bars?: ReactNode;
  tooltip: ReactNode;
  hoverLine: boolean;
};

function ChartColumn({
  index,
  label,
  width,
  barHeight,
  bars,
  tooltip,
  hoverLine,
}: ChartColumnProps) {
  const barsRef = useRef<HTMLDivElement>(null);

  return (
    <Tooltip>
      <TooltipTrigger
        delay={0}
        render={
          <div
            className={cn(
              "group/column flex flex-col items-center",
              !width && "min-w-0 flex-1",
            )}
            style={width ? { width } : undefined}
          />
        }
      >
        <div
          className="relative flex w-full items-end justify-center"
          style={{ height: PLOT_HEIGHT }}
        >
          {hoverLine && (
            <span className="pointer-events-none absolute inset-y-0 left-1/2 border-l border-dashed border-[#748399] opacity-0 transition-opacity group-hover/column:opacity-100" />
          )}
          {barHeight !== undefined && (
            <motion.div
              ref={barsRef}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{
                duration: 0.45,
                ease: "easeOut",
                delay: index * 0.03,
              }}
              className="flex origin-bottom items-end"
              style={{ height: `${barHeight * 100}%` }}
            >
              {bars}
            </motion.div>
          )}
        </div>
        <span className="mt-[13px] whitespace-nowrap transition-colors group-hover/column:text-foreground">
          {label}
        </span>
      </TooltipTrigger>
      <TooltipContent
        anchor={barHeight !== undefined ? barsRef : undefined}
        className="flex-col items-start gap-2.5 rounded-[13px] p-4 text-[13px] text-foreground"
      >
        {tooltip}
      </TooltipContent>
    </Tooltip>
  );
}

export function TooltipLine({
  dot,
  children,
}: {
  dot: string;
  children: ReactNode;
}) {
  return (
    <span className="flex items-center gap-1.5">
      <span aria-hidden className={cn("size-[7px] rounded-[2px]", dot)} />
      {children}
    </span>
  );
}
