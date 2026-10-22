import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { cn } from "cn";
import { format, parseISO } from "date-fns";
import { type ReactNode, useState } from "react";
import ChevronIcon from "@/assets/icons/chevron-down-20.svg?react";
import LinkIcon from "@/assets/icons/link.svg?react";
import LinkSlashIcon from "@/assets/icons/link-slash.svg?react";
import MinusCircleIcon from "@/assets/icons/minus-circle.svg?react";
import { type CountTab, CountTabs } from "@/components/count-tabs";
import { StatusBadge } from "@/components/status-badge";
import { SortHeader } from "@/components/table/sort-header";
import { TableMessage } from "@/components/table/table-message";
import { TwoLines } from "@/components/table/two-lines";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useDialog } from "@/hooks/use-dialog";
import { formatNumber } from "@/lib/format";
import { counterpartiesQuery, updateCounterparty } from "./api";
import { RequisiteCell } from "./requisite-cell";
import { BindRequisiteDialog } from "./requisite-dialogs";
import type { CounterpartiesSearch, CounterpartySortField } from "./schemas";
import type { Counterparty, CounterpartyCounts } from "./types";

const columns =
  "grid grid-cols-[150px_143px_259px_85px_127px_131px_144px_134px_143px_135px_minmax(110px,1fr)] items-center";

type Status = "active" | "disabled";

const statusTabs = (
  counts: CounterpartyCounts | undefined,
): CountTab<Status>[] => [
  { value: undefined, label: "Все", count: counts?.all },
  {
    value: "active",
    label: "Активные",
    count: counts?.active,
    dot: "bg-green",
  },
  {
    value: "disabled",
    label: "Выключенные",
    count: counts?.disabled,
    dot: "bg-foreground",
  },
];

export const conversionTone = (percent: number) =>
  percent >= 70
    ? "text-green"
    : percent >= 40
      ? "text-orange"
      : "text-destructive";

const rub = (value: string) => formatNumber(value, "auto");

type CounterpartiesTableProps = {
  search: CounterpartiesSearch;
  onChange: (patch: Partial<CounterpartiesSearch>) => void;
};

export function CounterpartiesTable({
  search,
  onChange,
}: CounterpartiesTableProps) {
  const { data, isPending, isError, refetch } = useQuery(
    counterpartiesQuery(search),
  );
  const client = useQueryClient();
  const blacklist = useMutation({
    mutationFn: (c: Counterparty) =>
      updateCounterparty(c.id, { blacklisted: !c.blacklisted }),
    onSettled: () => client.invalidateQueries({ queryKey: ["counterparties"] }),
  });
  const dialog = useDialog();
  const [binding, setBinding] = useState<Counterparty | null>(null);

  const sortHeader = (field: CounterpartySortField, label: string) => (
    <SortHeader
      label={label}
      active={search.sort === field}
      ascending={search.order === "asc"}
      onClick={() =>
        onChange(
          search.sort === field
            ? { order: search.order === "asc" ? "desc" : "asc" }
            : { sort: field, order: "asc" },
        )
      }
    />
  );

  return (
    <section className="rounded-2xl border border-border/80 bg-panel">
      <div className="px-4 pt-4">
        <CountTabs
          label="Статус контрагента"
          tabs={statusTabs(data?.counts)}
          value={search.status}
          onChange={(status) => onChange({ status })}
        />
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[1615px] text-[15px] leading-none font-semibold tracking-[-0.02em]">
          <div
            className={cn(
              columns,
              "border-b border-border/80 px-7 pt-[26px] pb-4 whitespace-nowrap",
            )}
          >
            {sortHeader("id", "Контрагент")}
            <span>Статус</span>
            <span>Реквизит</span>
            <span>Споры</span>
            {sortHeader("activity", "Активность")}
            {sortHeader("conversion", "Конверсия")}
            {sortHeader("averageCheck", "Средний чек")}
            {sortHeader("week", "Деп. за 7 д.")}
            {sortHeader("month", "Деп. за 30 д.")}
            {sortHeader("all", "Деп. за все время")}
          </div>

          {isPending ? (
            <TableMessage>Загрузка…</TableMessage>
          ) : isError ? (
            <TableMessage>
              Не удалось загрузить контрагентов
              <Button variant="secondary" onClick={() => refetch()}>
                Повторить
              </Button>
            </TableMessage>
          ) : data.items.length === 0 ? (
            <TableMessage>Ничего не найдено</TableMessage>
          ) : (
            <ul>
              {data.items.map((c) => (
                <CounterpartyRow
                  key={c.id}
                  counterparty={c}
                  onBind={() => {
                    setBinding(c);
                    dialog.show();
                  }}
                  onBlacklist={() => blacklist.mutate(c)}
                />
              ))}
            </ul>
          )}
        </div>
      </div>

      {dialog.mounted && binding && (
        <BindRequisiteDialog
          key={dialog.key}
          counterpartyId={binding.id}
          boundIds={binding.requisite ? [binding.requisite.id] : []}
          open={dialog.open}
          onOpenChange={dialog.onOpenChange}
        />
      )}
    </section>
  );
}

function RowAction({
  label,
  className,
  onClick,
  children,
}: {
  label: string;
  className: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            type="button"
            aria-label={label}
            onClick={onClick}
            className={cn(
              "grid size-[31px] place-items-center rounded-[8px] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring [&_svg]:size-5",
              className,
            )}
          />
        }
      >
        {children}
      </TooltipTrigger>
      <TooltipContent sideOffset={8} className="rounded-[13px] pt-2.5 pb-3">
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

function CounterpartyRow({
  counterparty: c,
  onBind,
  onBlacklist,
}: {
  counterparty: Counterparty;
  onBind: () => void;
  onBlacklist: () => void;
}) {
  return (
    <li
      className={cn(
        columns,
        "border-b border-border/80 px-7 py-4 last:border-b-0",
      )}
    >
      <TwoLines main={c.id} sub={c.merchant.name} />
      {c.enabled ? (
        <StatusBadge tone="green">Включен</StatusBadge>
      ) : (
        <StatusBadge tone="neutral">Отключен</StatusBadge>
      )}
      <RequisiteCell requisite={c.requisite} />
      <span>{c.disputes}</span>
      <div className="flex flex-col gap-1">
        <span>{c.activity.paid} оплат</span>
        <span className="text-[13px] text-muted-foreground">
          {c.activity.deals} сделок
        </span>
        <span className="text-[13px] text-muted-foreground">
          {c.activity.requests} запросов
        </span>
      </div>
      <div className="flex flex-col gap-1">
        <span
          className={cn(
            "flex items-center gap-[5px]",
            conversionTone(c.conversion),
          )}
        >
          <span aria-hidden className="size-2.5 rounded-[2px] bg-current" />
          {c.conversion}%
        </span>
        <span className="max-w-[106px] text-[13px] leading-[1.0] text-muted-foreground">
          Последний вход:{" "}
          {c.lastLoginAt ? format(parseISO(c.lastLoginAt), "dd.MM.yyyy") : "—"}
        </span>
      </div>
      <TwoLines main={rub(c.averageCheck)} sub="RUB" />
      <TwoLines main={rub(c.deposits.week)} sub="RUB" />
      <TwoLines main={rub(c.deposits.month)} sub="RUB" />
      <TwoLines main={rub(c.deposits.all)} sub="RUB" />
      <div className="flex items-center gap-5">
        <div className="flex gap-2">
          <RowAction
            label="Привязать"
            className="bg-[#1b2127]/60 hover:bg-[#1b2127]"
            onClick={onBind}
          >
            {c.requisite ? (
              <LinkIcon />
            ) : (
              <LinkSlashIcon className="opacity-60" />
            )}
          </RowAction>
          <RowAction
            label={c.blacklisted ? "Убрать из блеклиста" : "Заблокировать"}
            className={
              c.blacklisted
                ? "bg-destructive text-foreground hover:bg-destructive/80"
                : "bg-destructive/10 text-destructive hover:bg-destructive/20"
            }
            onClick={onBlacklist}
          >
            <MinusCircleIcon />
          </RowAction>
        </div>
        <Link
          to="/admin/merchants/counterparties/$counterpartyId"
          params={{ counterpartyId: c.id }}
          aria-label={`Открыть контрагента ${c.id}`}
          className="grid size-5 place-items-center rounded-[6px] text-foreground/60 outline-none transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ChevronIcon className="size-5 -rotate-90" />
        </Link>
      </div>
    </li>
  );
}
