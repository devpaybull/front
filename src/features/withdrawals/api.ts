import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import { apiGet, apiGetFile, apiPost } from "@/lib/api";
import type { WithdrawalsSearch } from "./schemas";
import type { Withdrawal, WithdrawalList, WithdrawalStats } from "./types";

export const withdrawalsQuery = (search: WithdrawalsSearch) =>
  queryOptions({
    queryKey: ["withdrawals", "list", search],
    queryFn: () => apiGet<WithdrawalList>("/withdrawals", search),
    placeholderData: keepPreviousData,
  });

export const withdrawalStatsQuery = () =>
  queryOptions({
    queryKey: ["withdrawals", "stats"],
    queryFn: () => apiGet<WithdrawalStats>("/withdrawals/stats"),
  });

export const exportWithdrawals = (search: WithdrawalsSearch) =>
  apiGetFile("/withdrawals/export", search);

export const confirmWithdrawal = (id: string, txHash: string) =>
  apiPost<Withdrawal>(`/withdrawals/${id}/confirm`, { txHash });
