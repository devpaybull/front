import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import type { InventorySearch } from "./schemas";
import type {
  InventoryFilterOptions,
  InventoryList,
  InventoryStats,
} from "./types";

export const inventoryFilterOptionsQuery = () =>
  queryOptions({
    queryKey: ["inventory", "filter-options"],
    queryFn: () => apiGet<InventoryFilterOptions>("/inventory/filter-options"),
    staleTime: Number.POSITIVE_INFINITY,
  });

export const inventoryStatsQuery = (
  filters: Pick<InventorySearch, "method" | "type" | "bank" | "merchant">,
) =>
  queryOptions({
    queryKey: ["inventory", "stats", filters],
    queryFn: () => apiGet<InventoryStats>("/inventory/stats", filters),
    placeholderData: keepPreviousData,
  });

export const inventoryListQuery = (filters: Pick<InventorySearch, "kind">) =>
  queryOptions({
    queryKey: ["inventory", "list", filters],
    queryFn: () => apiGet<InventoryList>("/inventory", filters),
    placeholderData: keepPreviousData,
  });
