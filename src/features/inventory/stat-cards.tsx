import type { ReactNode } from "react";
import { FilterSelect } from "@/components/filter-select";
import type { InventorySearch } from "./schemas";
import type { InventoryFilterOptions, InventoryStats } from "./types";

type StatCardsProps = {
  stats: InventoryStats | undefined;
  search: InventorySearch;
  options: InventoryFilterOptions | undefined;
  onChange: (patch: Partial<InventorySearch>) => void;
};

export function StatCards({
  stats,
  search,
  options,
  onChange,
}: StatCardsProps) {
  return (
    <div className="grid grid-cols-4 gap-5">
      <StatCard
        label="Доступные реквизиты для контрагентов"
        value={stats?.availableRequisites}
      />
      <StatCard label="Реквизиты в работе" value={stats?.requisitesInWork} />
      <StatCard
        label="КА на реквизитах"
        value={stats?.counterpartiesOnRequisites.used}
        total={stats?.counterpartiesOnRequisites.total}
        action={
          <FilterSelect
            size="sm"
            allLabel="Все мерчанты"
            options={options?.merchants ?? []}
            value={search.merchant}
            onChange={(merchant) => onChange({ merchant })}
            className="w-[179px]"
          />
        }
      />
      <StatCard
        label="Не получили реквизит КА"
        value={stats?.counterpartiesWithoutRequisite}
        footer={
          <button
            type="button"
            className="text-[13px] leading-none font-semibold tracking-[-0.02em] text-blue underline"
          >
            Показать
          </button>
        }
      />
    </div>
  );
}

type StatCardProps = {
  label: string;
  value: number | undefined;
  total?: number;
  action?: ReactNode;
  footer?: ReactNode;
};

function StatCard({ label, value, total, action, footer }: StatCardProps) {
  return (
    <section className="relative flex h-[103px] flex-col gap-2.5 rounded-2xl border border-border/80 bg-panel p-[19px] leading-none tracking-[-0.02em]">
      <h3 className="text-[13px] font-medium text-muted-foreground">{label}</h3>
      <p className="text-[40px] font-bold">
        {value ?? "—"}
        {total !== undefined && (
          <span className="text-[15px] text-muted-foreground"> / {total}</span>
        )}
      </p>
      {action && (
        <div className="absolute top-[11px] right-[11px]">{action}</div>
      )}
      {footer && (
        <div className="absolute right-[19px] bottom-[21px]">{footer}</div>
      )}
    </section>
  );
}
