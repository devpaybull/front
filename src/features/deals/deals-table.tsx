import { useQuery } from "@tanstack/react-query";
import { cn } from "cn";
import { type CountTab, CountTabs } from "@/components/count-tabs";
import { SortHeader } from "@/components/table/sort-header";
import { TableMessage } from "@/components/table/table-message";
import { Button } from "@/components/ui/button";
import { paymentMethodLabels } from "@/features/users/payment-methods";
import { dealsQuery } from "./api";
import { DealCells, dealColumns } from "./deal-cells";
import {
  type DealListSearch,
  type DealListSortField,
  type DealMethodTab,
  dealMethodTabs,
} from "./schemas";
import type { DealKind, DealList } from "./types";

const methodTabs = (
  counts: DealList["counts"] | undefined,
): CountTab<DealMethodTab>[] => [
  { value: undefined, label: "Все", count: counts?.all },
  ...dealMethodTabs.map((method) => ({
    value: method,
    label: paymentMethodLabels[method],
    count: counts?.[method],
  })),
];

type DealsTableProps = {
  kind: DealKind;
  search: DealListSearch;
  onChange: (patch: Partial<DealListSearch>) => void;
};

export function DealsTable({ kind, search, onChange }: DealsTableProps) {
  const { data, isPending, isError, refetch } = useQuery(
    dealsQuery(search, kind),
  );
  const { q, method, sort, order, ...filters } = search;
  const filtered =
    Boolean(q) || Object.values(filters).some((v) => v !== undefined);

  const sortHeader = (field: DealListSortField, label: string) => (
    <SortHeader
      label={label}
      active={sort === field}
      ascending={order === "asc"}
      onClick={() =>
        onChange(
          sort === field
            ? { order: order === "asc" ? "desc" : "asc" }
            : { sort: field, order: "asc" },
        )
      }
    />
  );

  return (
    <section className="rounded-2xl border border-border/80 bg-panel">
      <div className="px-4 pt-4">
        <CountTabs
          label="Метод оплаты"
          tabs={methodTabs(data?.counts)}
          value={method}
          onChange={(next) => onChange({ method: next })}
        />
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[1615px] text-[15px] leading-none font-semibold tracking-[-0.02em]">
          <div
            className={cn(
              dealColumns,
              "items-center border-b border-border/80 px-7 pt-[30px] pb-4",
            )}
          >
            {sortHeader("createdAt", "Дата / №")}
            <span>Срок / Статус</span>
            {sortHeader("amount", "Сумма")}
            <span>Обработчик</span>
            <span>Telegram</span>
            <span>Мерчант</span>
            <span>Реквизит / Контрагент</span>
          </div>

          {isPending ? (
            <TableMessage>Загрузка…</TableMessage>
          ) : isError ? (
            <TableMessage>
              {kind === "deal"
                ? "Не удалось загрузить сделки"
                : "Не удалось загрузить откупы"}
              <Button variant="secondary" onClick={() => refetch()}>
                Повторить
              </Button>
            </TableMessage>
          ) : data.items.length === 0 ? (
            <TableMessage>
              {filtered || method
                ? "Ничего не найдено"
                : kind === "deal"
                  ? "Сделок пока нет"
                  : "Откупов пока нет"}
            </TableMessage>
          ) : (
            <ul>
              {data.items.map((deal) => (
                <li
                  key={deal.id}
                  className={cn(
                    dealColumns,
                    "min-h-[66px] items-center border-b border-border/80 px-7 py-4 last:border-b-0",
                  )}
                >
                  <DealCells deal={deal} kind={kind} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
