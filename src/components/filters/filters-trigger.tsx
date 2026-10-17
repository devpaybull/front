import { cn } from "cn";
import type { ReactNode } from "react";
import CloseIcon from "@/assets/icons/close.svg?react";

type FiltersTriggerBoxProps = {
  label: string;
  icon: ReactNode;
  activeCount: number;
  onClear?: () => void;
  trigger: (props: { className: string; children: ReactNode }) => ReactNode;
};

export function FiltersTriggerBox({
  label,
  icon,
  activeCount,
  onClear,
  trigger,
}: FiltersTriggerBoxProps) {
  const active = activeCount > 0;
  return (
    <div className="flex h-11 shrink-0 items-center rounded-[14px] border border-border bg-secondary">
      {trigger({
        className: cn(
          "flex h-full items-center gap-2 rounded-[14px] px-6 text-[15px] leading-none font-medium tracking-[-0.02em] outline-none transition-opacity focus-visible:ring-3 focus-visible:ring-ring/50 data-popup-open:opacity-40",
          active && onClear && "pr-2",
        ),
        children: (
          <>
            {icon}
            <span className={cn(active && "text-primary")}>
              {active ? `${label} (${activeCount})` : label}
            </span>
          </>
        ),
      })}
      {active && onClear && (
        <>
          <span aria-hidden className="h-5 w-px bg-border" />
          <button
            type="button"
            aria-label="Сбросить фильтры"
            onClick={onClear}
            className="grid h-full place-items-center rounded-[14px] pr-6 pl-2 text-foreground outline-none transition-colors hover:text-primary focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <CloseIcon className="size-5" />
          </button>
        </>
      )}
    </div>
  );
}
