import { useIsFetching, useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import ArrowUpIcon from "@/assets/icons/arrow-up.svg?react";
import RobotIcon from "@/assets/icons/robot.svg?react";
import { FilterSelect } from "@/components/filter-select";
import { FiltersPopover } from "@/components/filters/filters-popover";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { useLiveSearch } from "@/hooks/use-live-search";
import { errorMessage } from "@/lib/api";
import { saveFile } from "@/lib/save-file";
import { exportDeals } from "./api";
import { dealStatuses } from "./deal-cells";
import { DealFilterFields } from "./deal-filter-fields";
import { DealsTable } from "./deals-table";
import { PeriodChip } from "./period-chip";
import {
  type DealFilters,
  type DealListSearch,
  dealStatusValues,
} from "./schemas";
import type { DealKind } from "./types";

const statusOptions = dealStatusValues.map((status) => ({
  value: status,
  label: dealStatuses[status].label,
}));

const noFilters: Record<keyof DealFilters, undefined> = {
  from: undefined,
  to: undefined,
  status: undefined,
  amountFrom: undefined,
  amountTo: undefined,
  trader: undefined,
  cascade: undefined,
  merchantGroup: undefined,
  counterparty: undefined,
  requisite: undefined,
};

type DealsListPageProps = {
  kind: DealKind;
  search: DealListSearch;
  onSearch: (patch: Partial<DealListSearch>) => void;
};

export function DealsListPage({ kind, search, onSearch }: DealsListPageProps) {
  const fetching = useIsFetching({ queryKey: ["deals", "list", kind] }) > 0;
  const [text, setText] = useLiveSearch(search.q, (q) => onSearch({ q }));
  const { q, method, sort, order, ...filters } = search;
  const activeFilters = Object.entries(filters).filter(
    ([key, value]) => value !== undefined && key !== "to",
  ).length;

  const exporting = useMutation({
    mutationFn: (next: DealFilters) => exportDeals(next, kind),
    onSuccess: (file) =>
      saveFile(
        file,
        `${kind === "deal" ? "deals" : "buyouts"}-${format(new Date(), "yyyy-MM-dd")}.csv`,
      ),
  });
  const searchHint =
    kind === "deal" ? "Поиск по номеру сделки" : "Поиск по номеру откупа";

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-4">
        <SearchInput
          className="flex-1"
          value={text}
          onChange={(event) => setText(event.target.value)}
          onClear={() => setText("")}
          loading={fetching}
          placeholder={searchHint}
          aria-label={searchHint}
        />
        <span aria-hidden className="h-7 w-px bg-border/80" />
        <PeriodChip
          value={search}
          onChange={({ from, to }) => onSearch({ from, to })}
        />
        <FilterSelect
          label="Статус:"
          allLabel="Все"
          options={statusOptions}
          value={search.status}
          onChange={(status) =>
            onSearch({ status: status as DealListSearch["status"] })
          }
          className="w-[210px] rounded-[14px] px-3.5"
        />
        <FiltersPopover
          value={filters}
          empty={{}}
          width={445}
          activeCount={activeFilters}
          onClear={() => onSearch(noFilters)}
          onApply={(next) => onSearch({ ...noFilters, ...next })}
        >
          {(draft, change) => (
            <DealFilterFields draft={draft} change={change} />
          )}
        </FiltersPopover>
        <FiltersPopover
          value={filters}
          empty={{}}
          width={445}
          label={exporting.isError ? "Повторить выгрузку" : "Выгрузить"}
          title="Выгрузка"
          icon={<ArrowUpIcon className="size-5" />}
          submitLabel={exporting.isPending ? "Формируем…" : "Сформировать"}
          submitting={exporting.isPending}
          onApply={(next) => exporting.mutate(next)}
        >
          {(draft, change) => (
            <DealFilterFields draft={draft} change={change} />
          )}
        </FiltersPopover>
        {kind === "buyout" && (
          <Button
            disabled
            title="Пока не готово: нет макета"
            className="gap-2.5 rounded-[14px]"
          >
            <RobotIcon className="size-5" />
            Авто-откупы
          </Button>
        )}
      </div>
      {exporting.isError && (
        <p role="alert" className="text-right text-[13px] text-destructive">
          {errorMessage(exporting.error)}
        </p>
      )}
      <DealsTable kind={kind} search={search} onChange={onSearch} />
    </div>
  );
}
