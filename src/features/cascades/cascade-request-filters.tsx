import { useQuery } from "@tanstack/react-query";
import {
  PeriodFilterField,
  SelectFilterField,
  TextFilterField,
} from "@/components/filters/filter-fields";
import { FiltersPopover } from "@/components/filters/filters-popover";
import { cascadeRequestFilterOptionsQuery } from "./api";
import type { CascadeRequestFilters } from "./schemas";

const toNumber = (v: string | undefined) => (v ? Number(v) : undefined);

export function CascadeRequestFiltersPopover({
  value,
  onApply,
  activeCount,
  onClear,
}: {
  value: CascadeRequestFilters;
  onApply: (next: CascadeRequestFilters) => void;
  activeCount: number;
  onClear: () => void;
}) {
  const { data: options } = useQuery(cascadeRequestFilterOptionsQuery());
  const asOptions = (values: string[] = []) =>
    values.map((v) => ({ value: v, label: v }));

  return (
    <FiltersPopover
      value={value}
      empty={{}}
      onApply={onApply}
      width={445}
      activeCount={activeCount}
      onClear={onClear}
    >
      {(draft, change) => (
        <>
          <PeriodFilterField
            value={draft}
            onChange={({ from, to }) => change({ from, to })}
          />
          <SelectFilterField
            label="Каскад"
            allLabel="Все каскады"
            options={asOptions(options?.cascades)}
            value={draft.cascade}
            onChange={(cascade) => change({ cascade })}
          />
          <div className="grid grid-cols-2 gap-2.5">
            <TextFilterField
              label="Сумма от"
              placeholder="От"
              numeric
              value={draft.amountFrom?.toString()}
              onChange={(v) => change({ amountFrom: toNumber(v) })}
            />
            <TextFilterField
              label="Сумма до"
              placeholder="До"
              numeric
              value={draft.amountTo?.toString()}
              onChange={(v) => change({ amountTo: toNumber(v) })}
            />
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <SelectFilterField
              label="Банк"
              allLabel="Все банки"
              options={asOptions(options?.banks)}
              value={draft.bank}
              onChange={(bank) => change({ bank })}
            />
            <SelectFilterField
              label="Метод"
              allLabel="Все методы"
              options={options?.methods ?? []}
              value={draft.method}
              onChange={(method) => change({ method })}
            />
          </div>
        </>
      )}
    </FiltersPopover>
  );
}
