import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import { apiGet, apiGetFile, apiPatch, apiPost, apiPostForm } from "@/lib/api";
import type { DealFilters, DealListSearch } from "./schemas";
import type {
  DealAction,
  DealDetails,
  DealFilterOptions,
  DealKind,
  DealList,
} from "./types";

export const dealsQuery = (search: DealListSearch, kind: DealKind = "deal") =>
  queryOptions({
    queryKey: ["deals", "list", kind, search],
    queryFn: () => apiGet<DealList>("/deals", { ...search, kind }),
    placeholderData: keepPreviousData,
  });

export const dealFilterOptionsQuery = () =>
  queryOptions({
    queryKey: ["deals", "filter-options"],
    queryFn: () => apiGet<DealFilterOptions>("/deals/filter-options"),
  });

export const exportDeals = (filters: DealFilters, kind: DealKind = "deal") =>
  apiGetFile("/deals/export", { ...filters, kind });

export const dealQuery = (id: string) =>
  queryOptions({
    queryKey: ["deals", "detail", id],
    queryFn: () => apiGet<DealDetails>(`/deals/${id}`),
  });

export const runDealAction = (id: string, action: DealAction) =>
  apiPost<DealDetails>(`/deals/${id}/actions`, { action });

export const changeDealAmount = (id: string, amount: string) =>
  apiPatch<DealDetails>(`/deals/${id}`, { amount });

export const assignDealTrader = (id: string, traderId: string) =>
  apiPost<DealDetails>(`/deals/${id}/trader`, { traderId });

export function openDealDispute(id: string, receipt: File, amount: string) {
  const form = new FormData();
  form.set("receipt", receipt);
  form.set("amount", amount);
  return apiPostForm<DealDetails>(`/deals/${id}/dispute`, form);
}
