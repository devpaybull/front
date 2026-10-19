import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import { apiGet, apiPatch, apiPost } from "@/lib/api";
import type { DebtorsSearch } from "./schemas";
import type { Debt, DebtLogEntry } from "./types";

export const debtsQuery = (search: DebtorsSearch) =>
  queryOptions({
    queryKey: ["debts", "list", search],
    queryFn: () => apiGet<Debt[]>("/debts", search),
    placeholderData: keepPreviousData,
  });

export const debtLogQuery = (id: string) =>
  queryOptions({
    queryKey: ["debts", "log", id],
    queryFn: () => apiGet<DebtLogEntry[]>(`/debts/${id}/log`),
  });

export const updateDebt = (
  id: string,
  patch: { comment?: string | null; autoDebitOn?: string | null },
) => apiPatch<Debt>(`/debts/${id}`, patch);

export const writeOffDebt = (id: string, amount: string) =>
  apiPost<Debt | undefined>(`/debts/${id}/write-off`, { amount });
