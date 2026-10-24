import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { cn } from "cn";
import ChevronIcon from "@/assets/icons/chevron-down-20.svg?react";
import { type CountTab, CountTabs } from "@/components/count-tabs";
import { IconCell, IconTile } from "@/components/icon-tile";
import { StatusBadge } from "@/components/status-badge";
import { SortHeader } from "@/components/table/sort-header";
import { TableMessage } from "@/components/table/table-message";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { BankLogo } from "@/features/deals/bank-logo";
import { banksQuery, updateBank } from "./api";
import { requisiteTypeLabels } from "./labels";
import type { BankSortField, BanksSearch } from "./schemas";
import type { Bank, BankList } from "./types";

const columns =
  "grid grid-cols-[265px_160px_255px_187px_248px_226px_minmax(0,1fr)_20px] items-center";

export const currencyOf = (search: BanksSearch, list?: BankList) =>
  search.currency ?? Object.keys(list?.counts ?? {})[0] ?? "RUB";

type BanksTableProps = {
  search: BanksSearch;
  onChange: (patch: Partial<BanksSearch>) => void;
};

export function BanksTable({ search, onChange }: BanksTableProps) {
  const { data, isPending, isError, refetch } = useQuery(banksQuery(search));
  const client = useQueryClient();
  const lists = { queryKey: ["banks", "list"] };
  const update = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Bank> }) =>
      updateBank(id, patch),
    onMutate: async ({ id, patch }) => {
      await client.cancelQueries(lists);
      const before = client.getQueriesData<BankList>(lists);
      client.setQueriesData<BankList>(
        lists,
        (list) =>
          list && {
            ...list,
            items: list.items.map((b) =>
              b.id === id ? { ...b, ...patch } : b,
            ),
          },
      );
      return { before };
    },
    onError: (_e, _v, context) => {
      for (const [key, list] of context?.before ?? [])
        client.setQueryData(key, list);
    },
    onSettled: () => client.invalidateQueries({ queryKey: ["banks"] }),
  });

  const tabs: CountTab<string>[] = Object.entries(data?.counts ?? {}).map(
    ([currency, count]) => ({ value: currency, label: currency, count }),
  );
  const currency = currencyOf(search, data);

  const sortHeader = (field: BankSortField, label: string) => (
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
      <div className="min-h-[53px] px-4 pt-4">
        <CountTabs
          label="Валюта"
          tabs={tabs}
          value={currency}
          onChange={(next) => next && onChange({ currency: next })}
        />
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[1615px] text-[15px] leading-none font-semibold tracking-[-0.02em]">
          <div
            className={cn(
              columns,
              "border-b border-border/80 px-7 pt-[34px] pb-4 whitespace-nowrap",
            )}
          >
            {sortHeader("name", "Банк")}
            <span>Валюта</span>
            <span>Трансгран валюты</span>
            {sortHeader("channels", "Каналы")}
            <span>Тип реквизитов</span>
            <span>Активен</span>
            <span>Автоматика</span>
          </div>

          {isPending ? (
            <TableMessage>Загрузка…</TableMessage>
          ) : isError ? (
            <TableMessage>
              Не удалось загрузить банки
              <Button variant="secondary" onClick={() => refetch()}>
                Повторить
              </Button>
            </TableMessage>
          ) : data.items.length === 0 ? (
            <TableMessage>
              {search.q ? "Ничего не найдено" : "Банков в этой валюте нет"}
            </TableMessage>
          ) : (
            <ul>
              {data.items.map((b) => (
                <li
                  key={b.id}
                  className={cn(
                    columns,
                    "border-b border-border/80 px-7 py-4 last:border-b-0",
                  )}
                >
                  <IconCell
                    tile={
                      <IconTile tone="light">
                        <BankLogo bank={b.name} />
                      </IconTile>
                    }
                    main={b.name}
                    sub={b.code ?? "Без кода"}
                  />
                  <span>{b.currency}</span>
                  <span>
                    {b.crossBorderCurrencies.length > 0
                      ? b.crossBorderCurrencies.join(", ")
                      : "Нет"}
                  </span>
                  <span>{b.channels}</span>
                  <span className="flex flex-wrap gap-1.5">
                    {b.requisiteTypes.map((t) => (
                      <StatusBadge key={t} tone="green">
                        {requisiteTypeLabels[t]}
                      </StatusBadge>
                    ))}
                  </span>
                  <Switch
                    size="sm"
                    aria-label={`Активен: ${b.name}`}
                    checked={b.active}
                    onCheckedChange={(active) =>
                      update.mutate({ id: b.id, patch: { active } })
                    }
                  />
                  <Switch
                    size="sm"
                    aria-label={`Автоматика: ${b.name}`}
                    checked={b.automation}
                    onCheckedChange={(automation) =>
                      update.mutate({ id: b.id, patch: { automation } })
                    }
                  />
                  <Link
                    to="/admin/config/banks/$bankId"
                    params={{ bankId: b.id }}
                    aria-label={`Открыть банк ${b.name}`}
                    className="grid size-5 place-items-center rounded-[6px] text-foreground/60 outline-none transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <ChevronIcon className="size-5 -rotate-90" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
