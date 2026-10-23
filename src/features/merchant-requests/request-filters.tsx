import { useQuery } from "@tanstack/react-query";
import {
  PeriodFilterField,
  SelectFilterField,
  TextFilterField,
} from "@/components/filters/filter-fields";
import { FiltersPopover } from "@/components/filters/filters-popover";
import { requestFilterOptionsQuery } from "./api";
import type { RequestFilters } from "./schemas";

const toNumber = (v: string | undefined) => (v ? Number(v) : undefined);

export function RequestFiltersPopover({
  value,
  onApply,
  activeCount,
  onClear,
}: {
  value: RequestFilters;
  onApply: (next: RequestFilters) => void;
  activeCount: number;
  onClear: () => void;
}) {
  const { data: options } = useQuery(requestFilterOptionsQuery());

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
              options={(options?.banks ?? []).map((b) => ({
                value: b,
                label: b,
              }))}
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
          <SelectFilterField
            label="Направления"
            allLabel="Все направления"
            options={[
              { value: "payIn", label: "Покупка pay-in" },
              { value: "payOut", label: "Продажа pay-out" },
            ]}
            value={draft.direction}
            onChange={(direction) =>
              change({ direction: direction as RequestFilters["direction"] })
            }
          />
        </>
      )}
    </FiltersPopover>
  );
}
