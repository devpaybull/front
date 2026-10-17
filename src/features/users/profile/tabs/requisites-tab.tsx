import { useIsFetching, useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { cn } from "cn";
import type { ReactNode } from "react";
import DocumentIcon from "@/assets/icons/document.svg?react";
import InventoryIcon from "@/assets/icons/inventory.svg?react";
import PhoneIcon from "@/assets/icons/phone-solid.svg?react";
import { SelectFilterField } from "@/components/filters/filter-fields";
import { FiltersPopover } from "@/components/filters/filters-popover";
import { IconTile } from "@/components/icon-tile";
import { LetterAvatar } from "@/components/letter-avatar";
import { SortHeader } from "@/components/table/sort-header";
import { TwoLines } from "@/components/table/two-lines";
import { SearchInput } from "@/components/ui/search-input";
import { Switch } from "@/components/ui/switch";
import { LimitChip } from "@/features/inventory/requisite-card";
import { useLiveSearch } from "@/hooks/use-live-search";
import { formatAmount, formatNumber, plural } from "@/lib/format";
import { userRequisitesQuery } from "../../api";
import type { RequisiteSortField, RequisitesSearch } from "../../schemas";
import type { UserRequisite } from "../../types";
import { rateBanks } from "../rates/banks";
import { TabRow, TabTable, tableState } from "./tab-table";
import { useToggleRequisite } from "./use-toggle-requisite";

const columns =
  "grid grid-cols-[116px_274px_267px_170px_197px_171px_minmax(0,1fr)]";

const kindIcons: Record<UserRequisite["kind"], ReactNode> = {
  sbp: <PhoneIcon />,
  card: <InventoryIcon />,
  account: <DocumentIcon />,
};

const scopes = {
  counterpartiesOnly: { label: "Только контрагенты", className: "text-blue" },
  reserve: { label: "Резервный реквизит", className: "text-orange" },
};

const statusOptions = [
  { value: "enabled", label: "Включен" },
  { value: "disabled", label: "Выключен" },
];
const bankOptions = rateBanks.map((bank) => ({ value: bank, label: bank }));

const searchHint = "Поиск по номеру реквизита/карте/телефону";

export function RequisitesTab({
  userId,
  search,
  onSearch,
}: {
  userId: string;
  search: RequisitesSearch;
  onSearch: (patch: Partial<RequisitesSearch>) => void;
}) {
  const query = useQuery(userRequisitesQuery(userId, search));
  const toggle = useToggleRequisite(userId);
  const fetching =
    useIsFetching({ queryKey: ["users", "detail", userId, "requisites"] }) > 0;
  const [text, setText] = useLiveSearch(search.q, (q) => onSearch({ q }));
  const filtered = Boolean(search.q || search.status || search.bank);

  const sortHeader = (field: RequisiteSortField, label: string) => (
    <SortHeader
      label={label}
      active={search.sort === field}
      ascending={search.order === "asc"}
      onClick={() =>
        onSearch(
          search.sort === field
            ? { order: search.order === "asc" ? "desc" : "asc" }
            : { sort: field, order: "asc" },
        )
      }
    />
  );

  return (
    <div className="-mt-2.5 flex flex-col gap-5">
      <div className="flex gap-4">
        <SearchInput
          className="flex-1"
          value={text}
          onChange={(event) => setText(event.target.value)}
          loading={fetching}
          placeholder={searchHint}
          aria-label={searchHint}
        />
        <FiltersPopover
          value={{ status: search.status, bank: search.bank }}
          empty={{}}
          onApply={({ status, bank }) => onSearch({ status, bank })}
        >
          {(draft, change) => (
            <>
              <SelectFilterField
                label="Статус"
                allLabel="Все статусы"
                options={statusOptions}
                value={draft.status}
                onChange={(status) =>
                  change({ status: status as RequisitesSearch["status"] })
                }
              />
              <SelectFilterField
                label="Банк"
                allLabel="Все банки"
                options={bankOptions}
                value={draft.bank}
                onChange={(bank) => change({ bank })}
              />
            </>
          )}
        </FiltersPopover>
      </div>
      <TabTable
        columns={columns}
        state={tableState(query)}
        emptyText={filtered ? "Ничего не нашлось" : "Реквизитов нет"}
        header={
          <>
            <span>Статус</span>
            <span>Реквизит</span>
            <span>Описание</span>
            {sortHeader("total", "Общая сумма")}
            <span>Трейдер</span>
            {sortHeader("amount", "Настройки")}
            {sortHeader("limits", "Лимиты")}
          </>
        }
      >
        {query.data?.map((requisite) => (
          <RequisiteRow
            key={requisite.id}
            requisite={requisite}
            onToggle={(enabled) => toggle.mutate({ id: requisite.id, enabled })}
          />
        ))}
      </TabTable>
    </div>
  );
}

function RequisiteRow({
  requisite: r,
  onToggle,
}: {
  requisite: UserRequisite;
  onToggle: (enabled: boolean) => void;
}) {
  const scope = r.scope && scopes[r.scope];
  const value =
    r.kind === "sbp" ? (
      <>
        <span className="text-muted-foreground">СБП</span> ({r.value})
      </>
    ) : (
      r.value
    );

  return (
    <TabRow columns={columns}>
      <Switch
        size="sm"
        checked={r.enabled}
        onCheckedChange={onToggle}
        aria-label={`Реквизит ${r.value}: ${r.enabled ? "включен" : "выключен"}`}
      />
      <div className="flex min-w-0 items-center gap-2">
        <IconTile tone="muted">{kindIcons[r.kind]}</IconTile>
        <div className="flex min-w-0 flex-col gap-1">
          <span className="truncate">{value}</span>
          {scope && (
            <span className={cn("text-[13px]", scope.className)}>
              {scope.label}
            </span>
          )}
        </div>
      </div>
      <TwoLines main={r.holder} sub={`Банк: ${r.bank}`} />
      <TwoLines main={formatNumber(r.total, "fixed")} sub="RUB" />
      <Link
        to="/admin/users/$userId"
        params={{ userId: r.trader.id }}
        className="flex w-fit min-w-0 items-center gap-2 outline-none transition-colors hover:text-primary focus-visible:text-primary"
      >
        <LetterAvatar name={r.trader.login} className="rounded-[8px]" />
        <span className="truncate">{r.trader.login}</span>
      </Link>
      <div className="flex flex-col gap-1">
        <span>
          {formatAmount(r.amount.min, "RUB")} /{" "}
          {r.amount.max ? formatAmount(r.amount.max, "RUB") : "∞"}{" "}
          <span className="text-muted-foreground">RUB</span>
        </span>
        <span className="text-[13px]">
          {r.counterparties.used} / {r.counterparties.total}{" "}
          <span className="text-muted-foreground">
            {plural(r.counterparties.total, [
              "контрагент",
              "контрагента",
              "контрагентов",
            ])}
          </span>
        </span>
      </div>
      <div className="flex justify-end gap-2.5">
        <LimitChip label="Дневной" usage={r.limits.daily} tone="blue" />
        <LimitChip label="Месячный" usage={r.limits.monthly} tone="orange" />
      </div>
    </TabRow>
  );
}
