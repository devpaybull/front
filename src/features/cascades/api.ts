import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import { apiGet, apiPatch } from "@/lib/api";
import type { CascadeRequestsSearch, CascadesSearch } from "./schemas";
import type {
  CascadeList,
  CascadeRequestFilterOptions,
  CascadeRequestList,
} from "./types";

export const cascadesQuery = (search: CascadesSearch) =>
  queryOptions({
    queryKey: ["cascades", "list", search],
    queryFn: () => apiGet<CascadeList>("/cascades", search),
    placeholderData: keepPreviousData,
  });

export const updateCascade = (
  id: string,
  patch: { enabled?: boolean; priority?: number },
) => apiPatch<void>(`/cascades/${id}`, patch);

const listParams = ({ open: _open, ...search }: CascadeRequestsSearch) =>
  search;

export const cascadeRequestsQuery = (search: CascadeRequestsSearch) =>
  queryOptions({
    queryKey: ["cascades", "requests", listParams(search)],
    queryFn: () =>
      apiGet<CascadeRequestList>("/cascade-requests", listParams(search)),
    placeholderData: keepPreviousData,
  });

export const cascadeRequestFilterOptionsQuery = () =>
  queryOptions({
    queryKey: ["cascades", "requests", "filter-options"],
    queryFn: () =>
      apiGet<CascadeRequestFilterOptions>("/cascade-requests/filter-options"),
    staleTime: 5 * 60_000,
  });
