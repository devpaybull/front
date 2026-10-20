import { cn } from "cn";
import type { ReactNode } from "react";
import { Panel } from "@/components/panel";

export function DealPanel({
  title,
  subtitle,
  aside,
  className,
  children,
}: {
  title: string;
  subtitle: string;
  aside?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Panel
      className={cn(
        "flex flex-col gap-5 p-5 leading-none tracking-[-0.02em]",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-5">
        <div className="flex flex-col gap-1.5">
          <h2 className="text-[17px] font-bold">{title}</h2>
          <p className="text-[13px] font-medium text-muted-foreground">
            {subtitle}
          </p>
        </div>
        {aside}
      </div>
      {children}
    </Panel>
  );
}

export function DealCard({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("rounded-[10px] bg-[#101419] p-5", className)}>
      {children}
    </div>
  );
}
