import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import { apiGet, apiGetFile } from "@/lib/api";
import type { RequestsSearch } from "./schemas";
import type {
  MerchantRequestDetails,
  MerchantRequestFilterOptions,
  MerchantRequestList,
} from "./types";

const listParams = ({ open: _open, ...search }: RequestsSearch) => search;

export const requestsQuery = (search: RequestsSearch) =>
  queryOptions({
    queryKey: ["merchant-requests", "list", listParams(search)],
    queryFn: () =>
      apiGet<MerchantRequestList>("/merchant-requests", listParams(search)),
    placeholderData: keepPreviousData,
  });

export const requestQuery = (id: string) =>
  queryOptions({
    queryKey: ["merchant-requests", "detail", id],
    queryFn: () => apiGet<MerchantRequestDetails>(`/merchant-requests/${id}`),
  });

export const requestFilterOptionsQuery = () =>
  queryOptions({
    queryKey: ["merchant-requests", "filter-options"],
    queryFn: () =>
      apiGet<MerchantRequestFilterOptions>("/merchant-requests/filter-options"),
    staleTime: 5 * 60_000,
  });

export const exportRequests = (search: RequestsSearch) =>
  apiGetFile("/merchant-requests/export", listParams(search));
