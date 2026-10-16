import { cn } from "cn";
import type { ReactNode } from "react";
import closeCircle from "@/assets/icons/close-circle.svg";
import DangerIcon from "@/assets/icons/danger-circle.svg?react";
import tickCircle from "@/assets/icons/tick-circle.svg";
import { Input } from "@/components/ui/input";
import type { RowCheck } from "./rates-draft";

export function PercentInput({
  value,
  onChange,
  label,
  invalid,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  invalid?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("relative w-[100px] shrink-0", className)}>
      <Input
        aria-label={label}
        inputMode="decimal"
        autoComplete="off"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={invalid || undefined}
        className="pr-8 aria-invalid:text-destructive"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[15px] font-semibold text-foreground/30"
      >
        %
      </span>
    </div>
  );
}

export function RowStatus({ check }: { check: RowCheck }) {
  return (
    <span
      className={cn(
        "flex w-[75px] shrink-0 items-center gap-2 text-[15px] leading-none font-semibold tracking-[-0.02em]",
        check.ok ? "text-green" : "text-destructive",
      )}
    >
      <img
        src={check.ok ? tickCircle : closeCircle}
        alt=""
        className="size-5"
      />
      {check.ok ? "Готово" : "Ошибка"}
    </span>
  );
}

export function RowMessage({ children }: { children: ReactNode }) {
  return (
    <p
      role="alert"
      className="flex items-center gap-1.5 text-[13px] leading-none font-semibold tracking-[-0.02em] text-destructive"
    >
      <DangerIcon className="size-5 shrink-0" />
      {children}
    </p>
  );
}

export const RowDivider = () => (
  <span aria-hidden className="mx-5 h-[31px] w-px shrink-0 bg-border/80" />
);
