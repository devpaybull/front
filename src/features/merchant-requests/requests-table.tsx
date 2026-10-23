import { useQuery } from "@tanstack/react-query";
import { cn } from "cn";
import ChevronIcon from "@/assets/icons/chevron-down-20.svg?react";
import MerchantsIcon from "@/assets/icons/merchants.svg?react";
import { type CountTab, CountTabs } from "@/components/count-tabs";
import { IconCell, IconTile } from "@/components/icon-tile";
import { LetterAvatar } from "@/components/letter-avatar";
import { SortHeader } from "@/components/table/sort-header";
import { TableMessage } from "@/components/table/table-message";
import { TwoLines } from "@/components/table/two-lines";
import { Button } from "@/components/ui/button";
import { dealMethods } from "@/features/deals/deal-cells";
import { formatDate, formatTime } from "@/lib/dates";
import { formatNumber } from "@/lib/format";
import { requestsQuery } from "./api";
import { directionLabels, ResultBadge } from "./labels";
import { RequestPanel } from "./request-panel";
import type { RequestSortField, RequestsSearch } from "./schemas";
import type {
  MerchantRequest,
  MerchantRequestCounts,
  RequestResult,
} from "./types";

const wide =
  "grid-cols-[171px_202px_225px_200px_203px_202px_219px_minmax(0,1fr)_20px]";
const narrow =
  "grid-cols-[110px_142px_203px_159px_114px_146px_131px_minmax(0,1fr)_20px]";

const resultTabs = (
  counts: MerchantRequestCounts | undefined,
): CountTab<RequestResult>[] => [
  { value: undefined, label: "Все", count: counts?.all },
  {
    value: "created",
    label: "Сделка создана",
    count: counts?.created,
    dot: "bg-green",
  },
  {
    value: "rejected",
    label: "Сделка не создана",
    count: counts?.rejected,
    dot: "bg-destructive",
  },
];

type RequestsTableProps = {
  search: RequestsSearch;
  onChange: (patch: Partial<RequestsSearch>) => void;
};

export function RequestsTable({ search, onChange }: RequestsTableProps) {
  const { data, isPending, isError, refetch } = useQuery(requestsQuery(search));
  const open = search.open;
  const columns = cn("grid items-center", open ? narrow : wide);

  const sortHeader = (field: RequestSortField, label: string) => (
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
    <section className="flex items-start rounded-2xl border border-border/80 bg-panel">
      <div className="min-w-0 flex-1">
        <div className="px-4 pt-4">
          <CountTabs
            label="Результат запроса"
            tabs={resultTabs(data?.counts)}
            value={search.result}
            onChange={(result) => onChange({ result })}
          />
        </div>

        <div className="overflow-x-auto">
          <div
            className={cn(
              "text-[15px] leading-none font-semibold tracking-[-0.02em]",
              open ? "min-w-[1150px]" : "min-w-[1615px]",
            )}
          >
            <div
              className={cn(
                columns,
                "border-b border-border/80 px-7 pt-[30px] pb-4 whitespace-nowrap",
              )}
            >
              {sortHeader("createdAt", "Время")}
              {sortHeader("merchant", "Мерчант")}
              <span>Запрос</span>
              {sortHeader("amount", "Сумма")}
              {sortHeader("merchantUserId", "User ID")}
              <span>Результат</span>
              <span>Обработано</span>
              <span>Ответ за</span>
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
                    columns={columns}
                    selected={r.id === open}
                    dimmed={!!open && r.id !== open}
                    onOpen={() =>
                      onChange({ open: r.id === open ? undefined : r.id })
                    }
                  />
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {open && (
        <RequestPanel id={open} onClose={() => onChange({ open: undefined })} />
      )}
    </section>
  );
}

function RequestRow({
  request: r,
  columns,
  selected,
  dimmed,
  onOpen,
}: {
  request: MerchantRequest;
  columns: string;
  selected: boolean;
  dimmed: boolean;
  onOpen: () => void;
}) {
  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: the › button does the same
    <li
      onClick={onOpen}
      className="relative cursor-pointer border-b border-border/80 px-7 py-4 last:border-b-0"
    >
      {selected && (
        <>
          <span
            aria-hidden
            className="absolute inset-x-1.5 inset-y-0 rounded-[2px] bg-[#1c2125]"
          />
          <span
            aria-hidden
            className="absolute top-1/2 left-1.5 h-7 w-1 -translate-y-1/2 rounded-full bg-blue"
          />
        </>
      )}
      <div
        className={cn(
          columns,
          "relative transition-opacity",
          dimmed && "opacity-60",
        )}
      >
        <TwoLines
          main={formatTime(r.createdAt, true)}
          sub={formatDate(r.createdAt)}
        />
        <span className="flex min-w-0 items-center gap-2">
          <IconTile tone="orange">
            <MerchantsIcon />
          </IconTile>
          <span className="truncate">{r.merchant.name}</span>
        </span>
        <IconCell
          tile={<IconTile tone="light">{dealMethods[r.method].icon}</IconTile>}
          main={r.methodName}
          sub={directionLabels[r.direction]}
        />
        <TwoLines
          main={
            <>
              {formatNumber(r.amount, "auto")}{" "}
              <span className="text-muted-foreground">RUB</span>
            </>
          }
          sub={r.bank ?? "Любой банк"}
        />
        <span>№{r.merchantUserId}</span>
        <ResultBadge result={r.result} />
        {r.processor ? (
          <span className="flex min-w-0 items-center gap-2">
            <LetterAvatar name={r.processor.login} />
            <span className="truncate">{r.processor.login}</span>
          </span>
        ) : (
          <span>-</span>
        )}
        <span>{r.responseMs} мс</span>
        <button
          type="button"
          aria-label={selected ? "Закрыть запрос" : "Открыть запрос"}
          aria-expanded={selected}
          onClick={(event) => {
            event.stopPropagation();
            onOpen();
          }}
          className="grid size-5 place-items-center rounded-[6px] text-foreground/60 outline-none transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ChevronIcon
            className={cn(
              "size-5 transition-transform",
              selected ? "rotate-90" : "-rotate-90",
            )}
          />
        </button>
      </div>
    </li>
  );
}
