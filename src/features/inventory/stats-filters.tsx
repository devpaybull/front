import { FilterSelect } from "@/components/filter-select";
import type { InventorySearch } from "./schemas";
import type { InventoryFilterOptions } from "./types";

type StatsFiltersProps = {
  search: InventorySearch;
  options: InventoryFilterOptions | undefined;
  onChange: (patch: Partial<InventorySearch>) => void;
};

export function StatsFilters({ search, options, onChange }: StatsFiltersProps) {
  return (
    <section className="flex flex-col gap-5 rounded-2xl border border-border/80 bg-panel p-[19px]">
      <header className="flex flex-col gap-1.5 leading-none tracking-[-0.02em]">
        <h2 className="text-[17px] font-bold">Статистика выдачи</h2>
        <p className="text-[13px] font-medium text-muted-foreground">
          Укажите параметры для отображения статистики
        </p>
      </header>
      <div className="flex gap-4">
        <FilterSelect
          label="Метод:"
          allLabel="Все методы"
          options={options?.methods ?? []}
          value={search.method}
          onChange={(method) => onChange({ method })}
        />
        <FilterSelect
          label="Тип:"
          allLabel="Все типы"
          options={options?.types ?? []}
          value={search.type}
          onChange={(type) => onChange({ type })}
        />
        <FilterSelect
          label="Банк:"
          allLabel="Все банки"
          options={options?.banks ?? []}
          value={search.bank}
          onChange={(bank) => onChange({ bank })}
        />
      </div>
    </section>
  );
}
