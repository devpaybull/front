import { useQuery } from "@tanstack/react-query";
import { cn } from "cn";
import type { ReactNode } from "react";
import { Panel } from "@/components/panel";
import { Tag } from "@/components/tag";
import { userStatsQuery } from "../api";
import { DealsChart } from "./deals-chart";
import { PayInChart } from "./pay-in-chart";
import { VolumeChart } from "./volume-chart";

export function UserStats({ userId }: { userId: string }) {
  const { data, isError } = useQuery(userStatsQuery(userId));
  const fallback = (
    <ChartMessage>
      {isError ? "Не удалось загрузить" : "Загрузка…"}
    </ChartMessage>
  );

  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      <ChartCard
        title="Количество сделок"
        legend={
          <>
            <Tag size="sm" dot tone="green">
              Успех
            </Tag>
            <Tag size="sm" dot tone="red">
              Фейл
            </Tag>
            <Tag size="sm" dot tone="amber">
              Спор
            </Tag>
          </>
        }
      >
        {data ? <DealsChart days={data.deals} /> : fallback}
      </ChartCard>

      <ChartCard
        title="Закрытые сделки"
        legend={
          <>
            <Tag size="sm" dot tone="primary">
              Pay-in
            </Tag>
            <Tag size="sm" dot tone="blue">
              Pay-out
            </Tag>
          </>
        }
      >
        {data ? <VolumeChart days={data.volume} /> : fallback}
      </ChartCard>

      <ChartCard
        className="md:col-span-2"
        title="Аналитика за последние 14 дней"
        subtitle="Статистика за Pay-in"
        aside={
          data && (
            <>
              <Tag size="sm" dot tone="green">
                Средняя конверсия: {data.payIn.conversion}%
              </Tag>
              <Tag size="sm" dot tone="orange">
                Споры: {data.payIn.disputes}%
              </Tag>
            </>
          )
        }
      >
        {data ? <PayInChart days={data.payIn.days} /> : fallback}
      </ChartCard>
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  legend,
  aside,
  className,
  children,
}: {
  title: string;
  subtitle?: string;
  legend?: ReactNode;
  aside?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Panel className={cn("flex min-w-0 flex-col p-7 pb-4", className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1 leading-none font-medium tracking-[-0.02em]">
          <h3 className="text-[15px]">{title}</h3>
          {subtitle && (
            <p className="text-[13px] text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {aside && (
          <div className="flex flex-wrap justify-end gap-2.5">{aside}</div>
        )}
      </div>
      {legend && (
        <div className="mt-[15px] flex flex-wrap gap-2.5">{legend}</div>
      )}
      <div className="mt-auto pt-[34px]">{children}</div>
    </Panel>
  );
}

function ChartMessage({ children }: { children: ReactNode }) {
  return (
    <div className="grid h-[190px] place-items-center text-[15px] font-semibold text-muted-foreground">
      {children}
    </div>
  );
}
