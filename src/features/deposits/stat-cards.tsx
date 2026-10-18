import { useQuery } from "@tanstack/react-query";
import ArrowDownIcon from "@/assets/icons/arrow-down.svg?react";
import InfoCircleIcon from "@/assets/icons/info-circle.svg?react";
import statusDoneUrl from "@/assets/icons/status-done.svg";
import TimeCircleIcon from "@/assets/icons/time-circle.svg?react";
import { IconTile } from "@/components/icon-tile";
import { StatCard, StatValue, SuccessRate } from "@/components/stat-card";
import { formatKiloUsdt, formatNumber, plural } from "@/lib/format";
import { depositStatsQuery } from "./api";

export function DepositStatCards() {
  const { data: stats } = useQuery(depositStatsQuery());
  const n = (value: number | undefined) =>
    value === undefined ? "…" : formatNumber(String(value), "auto");

  return (
    <div className="grid grid-cols-4 gap-2.5">
      <StatCard
        tile={
          <IconTile tone="blue">
            <ArrowDownIcon />
          </IconTile>
        }
        label="Всего пополнений"
        value={
          stats
            ? `${n(stats.total)} ${plural(stats.total, ["заявка", "заявки", "заявок"])}`
            : "…"
        }
        note={
          <>
            В процессе: <StatValue>{n(stats?.inProgress)}</StatValue>
          </>
        }
      />
      <StatCard
        tile={
          <IconTile tone="orange">
            <TimeCircleIcon />
          </IconTile>
        }
        label="В обработке"
        value={n(stats?.processing)}
        note={
          <>
            Ожидание tx,
            <br />
            AML или возврат
          </>
        }
      />
      <StatCard
        tile={
          <IconTile tone="red">
            <InfoCircleIcon />
          </IconTile>
        }
        label="Проблемные"
        value={n(stats?.problem)}
        note={
          <>
            AML failed: <StatValue>{n(stats?.amlFailed)}</StatValue>
          </>
        }
      />
      <StatCard
        tile={
          <IconTile tone="green">
            <img src={statusDoneUrl} alt="" className="size-5" />
          </IconTile>
        }
        label="Зачислено за 24 ч."
        value={stats ? formatKiloUsdt(stats.credited24h) : "…"}
        note={
          <>
            Успешных: <StatValue>{n(stats?.credited24hCount)}</StatValue>{" "}
            {stats && <SuccessRate rate={stats.successRate} />}
          </>
        }
      />
    </div>
  );
}
