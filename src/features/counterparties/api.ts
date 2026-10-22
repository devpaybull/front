import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import type { PaymentMethod } from "@/features/users/types";
import { apiDelete, apiGet, apiPatch, apiPost, apiPut } from "@/lib/api";
import type { CounterpartiesSearch } from "./schemas";
import type {
  BindChannel,
  BindType,
  CounterpartyDetails,
  CounterpartyEvents,
  CounterpartyEventTab,
  CounterpartyFilterOptions,
  CounterpartyList,
  CounterpartyRequisite,
  CounterpartyStats,
} from "./types";

export const counterpartiesQuery = (search: CounterpartiesSearch) =>
  queryOptions({
    queryKey: ["counterparties", "list", search],
    queryFn: () => apiGet<CounterpartyList>("/counterparties", search),
    placeholderData: keepPreviousData,
  });

export const counterpartyFilterOptionsQuery = () =>
  queryOptions({
    queryKey: ["counterparties", "filter-options"],
    queryFn: () =>
      apiGet<CounterpartyFilterOptions>("/counterparties/filter-options"),
    staleTime: 5 * 60_000,
  });

export const counterpartyQuery = (id: string) =>
  queryOptions({
    queryKey: ["counterparties", "detail", id],
    queryFn: () => apiGet<CounterpartyDetails>(`/counterparties/${id}`),
  });

export const counterpartyStatsQuery = (id: string, method?: PaymentMethod) =>
  queryOptions({
    queryKey: ["counterparties", "detail", id, "stats", method ?? "all"],
    queryFn: () =>
      apiGet<CounterpartyStats>(`/counterparties/${id}/stats`, { method }),
    placeholderData: keepPreviousData,
  });

export const counterpartyEventsQuery = (
  id: string,
  tab: CounterpartyEventTab,
) =>
  queryOptions({
    queryKey: ["counterparties", "detail", id, "events", tab],
    queryFn: () =>
      apiGet<CounterpartyEvents>(`/counterparties/${id}/events`, { tab }),
    placeholderData: keepPreviousData,
  });

export const counterpartyRequisitesQuery = (q: string) =>
  queryOptions({
    queryKey: ["counterparties", "requisites", q],
    queryFn: () =>
      apiGet<CounterpartyRequisite[]>("/counterparty-requisites", {
        q: q || undefined,
      }),
    placeholderData: keepPreviousData,
  });

export type CounterpartySwitches = {
  enabled?: boolean;
  blacklisted?: boolean;
  autoEnableBlocked?: boolean;
};

export const updateCounterparty = (id: string, patch: CounterpartySwitches) =>
  apiPatch<void>(`/counterparties/${id}`, patch);

export const bindRequisite = (
  id: string,
  binding: { requisiteId: string; bindType: BindType; channel: BindChannel },
) => apiPost<void>(`/counterparties/${id}/requisites`, binding);

export const replaceRequisite = (
  id: string,
  bindingId: string,
  requisiteId: string,
) =>
  apiPut<void>(`/counterparties/${id}/requisites/${bindingId}`, {
    requisiteId,
  });

export const unbindRequisite = (id: string, bindingId: string) =>
  apiDelete<void>(`/counterparties/${id}/requisites/${bindingId}`);
