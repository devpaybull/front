import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import { apiGet, apiGetFile, apiPost } from "@/lib/api";
import type { DepositsSearch } from "./schemas";
import type { Deposit, DepositList, DepositStats } from "./types";

export const depositsQuery = (search: DepositsSearch) =>
  queryOptions({
    queryKey: ["deposits", "list", search],
    queryFn: () => apiGet<DepositList>("/deposits", search),
    placeholderData: keepPreviousData,
  });

export const depositStatsQuery = () =>
  queryOptions({
    queryKey: ["deposits", "stats"],
    queryFn: () => apiGet<DepositStats>("/deposits/stats"),
  });

export const exportDeposits = (search: DepositsSearch) =>
  apiGetFile("/deposits/export", search);

export const confirmDeposit = (id: string, txHash: string) =>
  apiPost<Deposit>(`/deposits/${id}/confirm`, { txHash });
