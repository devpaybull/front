import { useQuery } from "@tanstack/react-query";
import { cn } from "cn";
import { format, parseISO } from "date-fns";
import { type ReactNode, useState } from "react";
import PercentIcon from "@/assets/icons/percent.svg?react";
import TimeCircleIcon from "@/assets/icons/time-circle.svg?react";
import WalletIcon from "@/assets/icons/wallet.svg?react";
import { FilterSelect } from "@/components/filter-select";
import { IconTile } from "@/components/icon-tile";
import { Panel } from "@/components/panel";
import { StatCard } from "@/components/stat-card";
import { paymentMethodLabels } from "@/features/users/payment-methods";
import type { PaymentMethod } from "@/features/users/types";
import { formatAgo } from "@/lib/dates";
import { formatAmount, formatNumber } from "@/lib/format";
import { counterpartyStatsQuery } from "./api";

const methodOptions = Object.entries(paymentMethodLabels).map(
  ([value, label]) => ({ value, label }),
);

export function BlockTitle({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="flex flex-col gap-2.5 leading-none tracking-[-0.02em]">
      <h3 className="text-[19px] font-bold">{title}</h3>
      <p className="text-[15px] font-medium text-muted-foreground">{sub}</p>
    </div>
  );
}

const bars = {
  orange: { track: "bg-orange/10", fill: "bg-orange" },
  blue: { track: "bg-blue/10", fill: "bg-blue" },
  green: { track: "bg-green/10", fill: "bg-green" },
};

function Tile({
  label,
  value,
  share,
  tone,
}: {
  label: ReactNode;
  value: string;
  share: number;
  tone: keyof typeof bars;
}) {
  return (
    <div className="flex flex-col gap-2.5 rounded-[10px] bg-[#101419] p-2.5 leading-none tracking-[-0.02em]">
      <span className="truncate text-[13px] font-medium text-foreground/60">
        {label}
      </span>
      <span className="flex items-center justify-between gap-4">
        <span className="text-[17px] font-medium">{value}</span>
        <span
          aria-hidden
          className={cn(
            "h-[19px] w-[79px] shrink-0 overflow-hidden rounded-full",
            bars[tone].track,
          )}
        >
          <span
            className={cn("block h-full rounded-full", bars[tone].fill)}
            style={{ width: `${Math.round(Math.min(1, share) * 100)}%` }}
          />
        </span>
      </span>
    </div>
  );
}

const percentOf = (part: number, whole: number) =>
  whole > 0 ? Math.round((part / whole) * 100) : 0;
const rub = (value: string) => `${formatAmount(value, "RUB")} ₽`;

export function CounterpartyStats({ id }: { id: string }) {
  const [method, setMethod] = useState<PaymentMethod | undefined>();
  const { data } = useQuery(counterpartyStatsQuery(id, method));

  return (
    <>
      <div className="flex items-start justify-between gap-6">
        <BlockTitle
          title="Статистика контрагента"
          sub="Выбраный метод применяется ко всем показателям ниже"
        />
        <FilterSelect
          label="Метод:"
          allLabel="Все методы"
          options={methodOptions}
          value={method}
          onChange={(value) => setMethod(value as PaymentMethod | undefined)}
          className="w-[310px]"
        />
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        <StatCard
          tile={
            <IconTile tone="orange">
              <PercentIcon />
            </IconTile>
          }
          label="Конверсия в оплату"
          value={data ? `${data.conversion}%` : "—"}
          note={data && `${data.paidDeals} из ${data.totalDeals} сделок`}
        />
        <StatCard
          tile={
            <IconTile tone="green">
              <WalletIcon />
            </IconTile>
          }
          label="Средний чек"
          value={data ? `${formatAmount(data.averageCheck, "RUB")} RUB` : "—"}
          note="По оплаченым сделкам"
        />
        <StatCard
          tile={
            <IconTile tone="blue">
              <TimeCircleIcon />
            </IconTile>
          }
          label="Последний депозит"
          value={data?.lastDepositAt ? formatAgo(data.lastDepositAt) : "—"}
          note={
            data?.lastDepositAt &&
            format(parseISO(data.lastDepositAt), "dd.MM.yyyy (HH:mm)")
          }
        />
      </div>

      <div className="grid grid-cols-2 gap-[21px]">
        <Panel className="flex flex-col gap-5 p-5">
          <BlockTitle
            title="Воронка контрагента"
            sub="Request → Trade → Paid · Конверсия по этапам"
          />
          {data && (
            <div className="grid grid-cols-3 gap-2.5">
              <Tile
                tone="orange"
                label={
                  <>
                    Запросы на сделку{" "}
                    <span className="text-foreground">
                      ({percentOf(data.funnel.deals, data.funnel.requests)}% в
                      сделки)
                    </span>
                  </>
                }
                value={formatNumber(String(data.funnel.requests), "auto")}
                share={1}
              />
              <Tile
                tone="blue"
                label={
                  <>
                    Созданные сделки{" "}
                    <span className="text-foreground">
                      ({percentOf(data.funnel.paid, data.funnel.deals)}% в
                      оплату)
                    </span>
                  </>
                }
                value={formatNumber(String(data.funnel.deals), "auto")}
                share={data.funnel.deals / (data.funnel.requests || 1)}
              />
              <Tile
                tone="green"
                label="Оплаченые сделки"
                value={formatNumber(String(data.funnel.paid), "auto")}
                share={data.funnel.paid / (data.funnel.requests || 1)}
              />
            </div>
          )}
        </Panel>
        <Panel className="flex flex-col gap-5 p-5">
          <BlockTitle
            title="Объем депозитов"
            sub="Оплаты по контрагенту / Валюта RUB"
          />
          {data && (
            <div className="grid grid-cols-3 gap-2.5">
              <Tile
                tone="orange"
                label="За 7 дней"
                value={rub(data.volume.week)}
                share={
                  Number(data.volume.week) / (Number(data.volume.all) || 1)
                }
              />
              <Tile
                tone="blue"
                label="За 30 дней"
                value={rub(data.volume.month)}
                share={
                  Number(data.volume.month) / (Number(data.volume.all) || 1)
                }
              />
              <Tile
                tone="green"
                label="За все время"
                value={rub(data.volume.all)}
                share={1}
              />
            </div>
          )}
        </Panel>
      </div>
    </>
  );
}
