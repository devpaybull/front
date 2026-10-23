import { useQuery } from "@tanstack/react-query";
import { cn } from "cn";
import CascadesIcon from "@/assets/icons/cascades.svg?react";
import ChevronIcon from "@/assets/icons/chevron-down-20.svg?react";
import { type CountTab, CountTabs } from "@/components/count-tabs";
import { IconCell, IconTile } from "@/components/icon-tile";
import { JsonCode } from "@/components/json-code";
import { SortHeader } from "@/components/table/sort-header";
import { TableMessage } from "@/components/table/table-message";
import { TwoLines } from "@/components/table/two-lines";
import { Button } from "@/components/ui/button";
import { dealMethods } from "@/features/deals/deal-cells";
import { paymentMethodLabels } from "@/features/users/payment-methods";
import { formatDate, formatTime } from "@/lib/dates";
import { formatAmount, shortId } from "@/lib/format";
import { cascadeRequestsQuery } from "./api";
import type { CascadeRequestSortField, CascadeRequestsSearch } from "./schemas";
import type {
  CascadeRequest,
  CascadeRequestList,
  CascadeRequestResult,
} from "./types";

const columns =
  "grid grid-cols-[148px_266px_277px_243px_219px_209px_minmax(0,1fr)_20px] items-center";

const resultTabs = (
  counts: CascadeRequestList["counts"] | undefined,
): CountTab<CascadeRequestResult>[] => [
  { value: undefined, label: "Все", count: counts?.all },
  {
    value: "success",
    label: "Успешные",
    count: counts?.success,
    dot: "bg-green",
  },
  {
    value: "error",
    label: "С ошибкой",
    count: counts?.error,
    dot: "bg-destructive",
  },
];

const directions = { payIn: "Покупка pay-in", payOut: "Продажа pay-out" };

type TableProps = {
  search: CascadeRequestsSearch;
  onChange: (patch: Partial<CascadeRequestsSearch>) => void;
};

export function CascadeRequestsTable({ search, onChange }: TableProps) {
  const { data, isPending, isError, refetch } = useQuery(
    cascadeRequestsQuery(search),
  );

  const sortHeader = (field: CascadeRequestSortField, label: string) => (
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
          label="Результат запроса"
          tabs={resultTabs(data?.counts)}
          value={search.result}
          onChange={(result) => onChange({ result })}
        />
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[1615px] text-[15px] leading-none font-semibold tracking-[-0.02em]">
          <div
            className={cn(
              columns,
              "border-b border-border/80 px-7 pt-[30px] pb-4 whitespace-nowrap",
            )}
          >
            {sortHeader("createdAt", "Время")}
            <span>Каскад</span>
            <span>Запрос</span>
            {sortHeader("amount", "Сумма")}
            {sortHeader("bank", "Банк")}
            <span>Результат</span>
            {sortHeader("responseMs", "Ответ за")}
          </div>

          {isPending ? (
            <TableMessage>Загрузка…</TableMessage>
          ) : isError ? (
            <TableMessage>
              Не удалось загрузить запросы
              <Button variant="secondary" onClick={() => refetch()}>
                Повторить
              </Button>
            </TableMessage>
          ) : data.items.length === 0 ? (
            <TableMessage>Ничего не найдено</TableMessage>
          ) : (
            <ul>
              {data.items.map((r) => (
                <RequestRow
                  key={r.id}
                  request={r}
                  open={r.id === search.open}
                  onToggle={() =>
                    onChange({ open: r.id === search.open ? undefined : r.id })
                  }
                />
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

function RequestRow({
  request: r,
  open,
  onToggle,
}: {
  request: CascadeRequest;
  open: boolean;
  onToggle: () => void;
}) {
  const ok = r.result === "success";
  return (
    <li className="border-b border-border/80 px-7 py-4 last:border-b-0">
      <div className={columns}>
        <TwoLines
          main={formatTime(r.createdAt, true)}
          sub={formatDate(r.createdAt)}
        />
        <IconCell
          tile={
            <IconTile tone="blue">
              <CascadesIcon />
            </IconTile>
          }
          main={r.cascade.name}
          sub={<span title={r.cascade.id}>#{shortId(r.cascade.id, 4, 4)}</span>}
        />
        <IconCell
          tile={
            <IconTile tone="primary">{dealMethods[r.method].icon}</IconTile>
          }
          main={paymentMethodLabels[r.method]}
          sub={directions[r.direction]}
        />
        <span>{formatAmount(r.amount, "RUB")} RUB</span>
        <span>{r.bank ?? "Любой банк"}</span>
        <div className="flex flex-col gap-1">
          <span
            className={cn(
              "flex items-center gap-[5px]",
              ok ? "text-green" : "text-destructive",
            )}
          >
            <span aria-hidden className="size-2.5 rounded-[2px] bg-current" />
            {ok ? "Успешно" : "Ошибка"}
          </span>
          <span className="text-[13px] text-muted-foreground">
            HTTP {r.httpStatus}
          </span>
        </div>
        <span>{r.responseMs} мс.</span>
        <button
          type="button"
          aria-label={open ? "Скрыть запрос" : "Показать запрос"}
          aria-expanded={open}
          onClick={onToggle}
          className="grid size-5 place-items-center rounded-[6px] outline-none transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ChevronIcon
            className={cn("size-5 transition-transform", open && "rotate-180")}
          />
        </button>
      </div>
      {open && (
        <div className="mt-4 grid grid-cols-2 gap-[21px]">
          {(
            [
              ["Запрос", r.body],
              ["Ответ", r.response],
            ] as const
          ).map(([title, value]) => (
            <div
              key={title}
              className="flex min-w-0 flex-col gap-3 rounded-[11px] bg-[#101419]/60 p-3.5"
            >
              <h3 className="text-[13px]">{title}</h3>
              <JsonCode value={value} wrap />
            </div>
          ))}
        </div>
      )}
    </li>
  );
}
