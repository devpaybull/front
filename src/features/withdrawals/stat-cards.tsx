import { useQuery } from "@tanstack/react-query";
import ArrowUpIcon from "@/assets/icons/arrow-up.svg?react";
import InfoCircleIcon from "@/assets/icons/info-circle.svg?react";
import statusDoneUrl from "@/assets/icons/status-done.svg";
import TimeCircleIcon from "@/assets/icons/time-circle.svg?react";
import { IconTile } from "@/components/icon-tile";
import { StatCard, StatValue, SuccessRate } from "@/components/stat-card";
import { formatKiloUsdt, formatNumber, plural } from "@/lib/format";
import { withdrawalStatsQuery } from "./api";

export function WithdrawalStatCards() {
  const { data: stats } = useQuery(withdrawalStatsQuery());
  const n = (value: number | undefined) =>
    value === undefined ? "…" : formatNumber(String(value), "auto");

  return (
    <div className="grid grid-cols-4 gap-2.5">
      <StatCard
        tile={
          <IconTile tone="blue">
            <ArrowUpIcon />
          </IconTile>
        }
        label="В очереди"
        value={
          stats
            ? `${n(stats.queued)} ${plural(stats.queued, ["заявка", "заявки", "заявок"])}`
            : "…"
        }
        note={
          <>
            Активные: <StatValue>{n(stats?.active)}</StatValue>
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
            Старше 30 мин.: <StatValue>{n(stats?.stale)}</StatValue>
          </>
        }
      />
      <StatCard
        tile={
          <IconTile tone="red">
            <InfoCircleIcon />
          </IconTile>
        }
        label="Manual review"
        value={n(stats?.manualReview)}
        note={
          <>
            К разбору: <StatValue>{n(stats?.toReview)}</StatValue>
          </>
        }
      />
      <StatCard
        tile={
          <IconTile tone="green">
            <img src={statusDoneUrl} alt="" className="size-5" />
          </IconTile>
        }
        label="Выплачено за 24 ч."
        value={stats ? formatKiloUsdt(stats.paid24h) : "…"}
        note={
          <>
            Успешных: <StatValue>{n(stats?.paid24hCount)}</StatValue>{" "}
            {stats && <SuccessRate rate={stats.successRate} />}
          </>
        }
      />
    </div>
  );
}
