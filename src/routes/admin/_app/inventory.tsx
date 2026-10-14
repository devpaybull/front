import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  inventoryFilterOptionsQuery,
  inventoryStatsQuery,
} from "@/features/inventory/api";
import { InventoryTable } from "@/features/inventory/inventory-table";
import {
  type InventorySearch,
  inventorySearchSchema,
} from "@/features/inventory/schemas";
import { StatCards } from "@/features/inventory/stat-cards";
import { StatsFilters } from "@/features/inventory/stats-filters";

export const Route = createFileRoute("/admin/_app/inventory")({
  staticData: { title: "Инвентарь", subtitle: "Общие показатели" },
  validateSearch: inventorySearchSchema,
  component: InventoryPage,
});

function InventoryPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  const setSearch = (patch: Partial<InventorySearch>) =>
    navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true });

  const { data: options } = useQuery(inventoryFilterOptionsQuery());
  const { data: stats } = useQuery(
    inventoryStatsQuery({
      method: search.method,
      type: search.type,
      bank: search.bank,
      merchant: search.merchant,
    }),
  );

  return (
    <div className="flex flex-col gap-5">
      <StatsFilters search={search} options={options} onChange={setSearch} />
      <StatCards
        stats={stats}
        search={search}
        options={options}
        onChange={setSearch}
      />
      <hr className="my-2.5 border-border/80" />
      <InventoryTable
        kind={search.kind}
        onKindChange={(kind) => setSearch({ kind })}
      />
    </div>
  );
}
