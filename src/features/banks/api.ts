import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import { apiGet, apiPatch, apiPost } from "@/lib/api";
import type { BanksSearch, NewBankForm } from "./schemas";
import type { Bank, BankList, BankOptions } from "./types";

export const banksQuery = (search: BanksSearch) =>
  queryOptions({
    queryKey: ["banks", "list", search],
    queryFn: () => apiGet<BankList>("/banks", search),
    placeholderData: keepPreviousData,
  });

export const bankQuery = (id: string) =>
  queryOptions({
    queryKey: ["banks", "detail", id],
    queryFn: () => apiGet<Bank>(`/banks/${id}`),
  });

export const bankOptionsQuery = () =>
  queryOptions({
    queryKey: ["banks", "options"],
    queryFn: () => apiGet<BankOptions>("/banks/options"),
    staleTime: 5 * 60_000,
  });

export const createBank = (bank: NewBankForm) =>
  apiPost<Bank>("/banks", { ...bank, country: bank.country || null });

export const updateBank = (
  id: string,
  patch: Partial<Pick<Bank, "active" | "automation" | "multiRequisites">>,
) => apiPatch<void>(`/banks/${id}`, patch);
