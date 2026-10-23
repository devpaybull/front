import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { cn } from "cn";
import type { ReactNode } from "react";
import CascadesIcon from "@/assets/icons/cascades.svg?react";
import FilterIcon from "@/assets/icons/filters.svg?react";
import ShareIcon from "@/assets/icons/share-box.svg?react";
import { IconCell, IconTile } from "@/components/icon-tile";
import { SortHeader } from "@/components/table/sort-header";
import { TableMessage } from "@/components/table/table-message";
import { TwoLines } from "@/components/table/two-lines";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatAmount, shortId } from "@/lib/format";
import { cascadesQuery, updateCascade } from "./api";
import type { CascadeSortField, CascadesSearch } from "./schemas";
import type { Cascade, CascadeList } from "./types";

const columns =
  "grid grid-cols-[125px_234px_177px_230px_220px_206px_minmax(0,1fr)_70px] items-center";

const rub = (v: string) => `${formatAmount(v, "RUB")} RUB`;
const usdt = (v: string) => `${formatAmount(v, "USDT")} USDT`;

type CascadesTableProps = {
  search: CascadesSearch;
  onChange: (patch: Partial<CascadesSearch>) => void;
};

export function CascadesTable({ search, onChange }: CascadesTableProps) {
  const { data, isPending, isError, refetch } = useQuery(cascadesQuery(search));
  const client = useQueryClient();
  const lists = { queryKey: ["cascades", "list"] };
  const update = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Cascade> }) =>
      updateCascade(id, patch),
    onMutate: async ({ id, patch }) => {
      await client.cancelQueries(lists);
      const before = client.getQueriesData<CascadeList>(lists);
      client.setQueriesData<CascadeList>(
        lists,
        (list) =>
          list && {
            items: list.items.map((c) =>
              c.id === id ? { ...c, ...patch } : c,
            ),
          },
      );
      return { before };
    },
    onError: (_e, _v, context) => {
      for (const [key, list] of context?.before ?? [])
        client.setQueryData(key, list);
    },
    onSettled: () => client.invalidateQueries({ queryKey: ["cascades"] }),
  });

  const sortHeader = (field: CascadeSortField, label: string) => (
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
  const count = data?.items.length ?? 0;

  return (
    <section className="rounded-2xl border border-border/80 bg-panel">
      <div className="overflow-x-auto">
        <div className="min-w-[1615px] text-[15px] leading-none font-semibold tracking-[-0.02em]">
          <div
            className={cn(
              columns,
              "h-16 border-b border-border/80 px-7 whitespace-nowrap",
            )}
          >
            <span>Статус</span>
            <span>Каскад</span>
            {sortHeader("priority", "Приоритет")}
            {sortHeader("volume", "Объем сегодня")}
            {sortHeader("dealsPerMinute", "Сделок в мин.")}
            {sortHeader("merchants", "Мерчанты")}
            {sortHeader("balance", "Балансы")}
          </div>

          {isPending ? (
            <TableMessage>Загрузка…</TableMessage>
          ) : isError ? (
            <TableMessage>
              Не удалось загрузить каскады
              <Button variant="secondary" onClick={() => refetch()}>
                Повторить
              </Button>
            </TableMessage>
          ) : data.items.length === 0 ? (
            <TableMessage>
              {search.q || search.status
                ? "Ничего не найдено"
                : "Каскадов пока нет"}
            </TableMessage>
          ) : (
            <ul>
              {data.items.map((c) => (
                <li
                  key={c.id}
                  className={cn(
                    columns,
                    "border-b border-border/80 px-7 py-4 last:border-b-0",
                  )}
                >
                  <Switch
                    size="sm"
                    aria-label={`Статус: ${c.name}`}
                    checked={c.enabled}
                    onCheckedChange={(enabled) =>
                      update.mutate({ id: c.id, patch: { enabled } })
                    }
                  />
                  <IconCell
                    tile={
                      <IconTile tone="blue">
                        <CascadesIcon />
                      </IconTile>
                    }
                    main={c.name}
                    sub={<span title={c.id}>#{shortId(c.id, 4, 4)}</span>}
                  />
                  <PrioritySelect
                    name={c.name}
                    value={c.priority}
                    count={count}
                    onChange={(priority) =>
                      update.mutate({ id: c.id, patch: { priority } })
                    }
                  />
                  <TwoLines
                    main={rub(c.volumeToday.rub)}
                    sub={usdt(c.volumeToday.usdt)}
                  />
                  <TwoLines
                    main={c.dealsPerMinute}
                    sub={`${formatAmount(c.amountRange.min, "RUB").replace(/,00$/, "")} ₽ - ${formatAmount(c.amountRange.max, "RUB").replace(/,00$/, "")} ₽`}
                  />
                  <TwoLines
                    main={c.merchants.count}
                    sub={c.merchants.all ? "Все доступные" : "Выбранные"}
                  />
                  <div className="flex flex-col gap-1">
                    <span>{usdt(c.balance.total)}</span>
                    <span className="text-[13px] text-muted-foreground">
                      Без активных: {usdt(c.balance.withoutActive)}
                    </span>
                    <span className="text-[13px] text-muted-foreground">
                      Лимит: {usdt(c.balance.limit)}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <RowLink
                      label="Настройки каскада"
                      to="/admin/users/$userId"
                      params={{ userId: c.userId }}
                    >
                      <FilterIcon />
                    </RowLink>
                    <RowLink
                      label="Запросы к каскаду"
                      to="/admin/cascades/history"
                      search={{ cascade: c.name }}
                    >
                      <ShareIcon />
                    </RowLink>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

function PrioritySelect({
  name,
  value,
  count,
  onChange,
}: {
  name: string;
  value: number;
  count: number;
  onChange: (priority: number) => void;
}) {
  const items = Array.from({ length: Math.max(count, value) }, (_, n) => ({
    value: n + 1,
    label: String(n + 1),
  }));
  return (
    <Select
      items={items}
      value={value}
      onValueChange={(next) => next !== null && onChange(next)}
    >
      <SelectTrigger
        aria-label={`Приоритет: ${name}`}
        className="w-[65px] data-[size=default]:h-[35px] data-[size=default]:rounded-[12px] data-[size=default]:px-3"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {items.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function RowLink({
  label,
  children,
  ...link
}: {
  label: string;
  children: ReactNode;
} & (
  | { to: "/admin/users/$userId"; params: { userId: string } }
  | { to: "/admin/cascades/history"; search: { cascade: string } }
)) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Link
            {...link}
            aria-label={label}
            className="grid size-[31px] place-items-center rounded-[8px] bg-[#1b2127]/60 outline-none transition-colors hover:bg-[#1b2127] focus-visible:ring-2 focus-visible:ring-ring [&_svg]:size-5"
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
