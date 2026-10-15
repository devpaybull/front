import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import {
  apiDelete,
  apiGet,
  apiGetFile,
  apiPatch,
  apiPost,
  apiPut,
} from "@/lib/api";
import type {
  AssignLeads,
  BalanceSearch,
  DealsSearch,
  Debt,
  MinInsurance,
  RequisitesSearch,
  Transfer,
  UsersSearch,
} from "./schemas";
import type {
  BalanceOperation,
  CurrencyRates,
  UserDeal,
  UserFingerprint,
  UserList,
  UserLog,
  UserProfile,
  UserReferral,
  UserRequisite,
  UserSettings,
  UserStats,
} from "./types";

export const usersQuery = (search: UsersSearch) =>
  queryOptions({
    queryKey: ["users", "list", search],
    queryFn: () => apiGet<UserList>("/users", search),
    placeholderData: keepPreviousData,
  });

export const userQuery = (id: string) =>
  queryOptions({
    queryKey: ["users", "detail", id],
    queryFn: () => apiGet<UserProfile>(`/users/${id}`),
  });

export const userRatesQuery = (id: string) =>
  queryOptions({
    queryKey: ["users", "detail", id, "rates"],
    queryFn: () => apiGet<CurrencyRates[]>(`/users/${id}/rates`),
  });

export const userStatsQuery = (id: string) =>
  queryOptions({
    queryKey: ["users", "detail", id, "stats"],
    queryFn: () => apiGet<UserStats>(`/users/${id}/stats`),
  });

export const updateUserSettings = (
  id: string,
  patch: Partial<UserSettings>,
  reason?: string,
) =>
  apiPatch<UserProfile>(`/users/${id}/settings`, {
    ...patch,
    reason: reason || undefined,
  });

export const saveUserNote = (id: string, text: string) =>
  apiPut<UserProfile>(`/users/${id}/note`, { text });

export const deleteUserNote = (id: string) =>
  apiDelete<UserProfile>(`/users/${id}/note`);

export const transferBalance = (id: string, transfer: Transfer) =>
  apiPost<UserProfile>(`/users/${id}/transfers`, {
    recipientId: transfer.recipient?.id,
    amount: transfer.amount,
    comment: transfer.comment || undefined,
  });

export const assignLeads = (id: string, { leads }: AssignLeads) =>
  apiPost<UserProfile>(
    `/users/${id}/leads`,
    leads.map(({ lead, ...rates }) => ({ leadId: lead?.id, ...rates })),
  );

export const endUserSessions = (id: string) =>
  apiPost<void>(`/users/${id}/sessions/end`);

export const resetUserPassword = (id: string) =>
  apiPost<{ password: string }>(`/users/${id}/password-reset`);

export const resetUserTwoFactor = (id: string) =>
  apiPost<void>(`/users/${id}/2fa-reset`);

export const lendToUser = (id: string, { amount }: Debt) =>
  apiPost<UserProfile>(`/users/${id}/debts`, { amount });

export const updateMinInsurance = (id: string, values: MinInsurance) =>
  apiPut<UserProfile>(`/users/${id}/min-insurance`, values);

export const updateTelegram = (
  id: string,
  patch: {
    telegram?: string;
    telegramId?: string;
    telegramGroups?: string[];
  },
) => apiPatch<UserProfile>(`/users/${id}/telegram`, patch);

export const saveUserRates = (id: string, rates: CurrencyRates[]) =>
  apiPut<CurrencyRates[]>(`/users/${id}/rates`, rates);

export const userFingerprintsQuery = (id: string) =>
  queryOptions({
    queryKey: ["users", "detail", id, "fingerprints"],
    queryFn: () => apiGet<UserFingerprint[]>(`/users/${id}/fingerprints`),
  });

export const userReferralsQuery = (id: string) =>
  queryOptions({
    queryKey: ["users", "detail", id, "referrals"],
    queryFn: () => apiGet<UserReferral[]>(`/users/${id}/referrals`),
  });

export const userBalanceQuery = (id: string, search: BalanceSearch) =>
  queryOptions({
    queryKey: ["users", "detail", id, "balance", search],
    queryFn: () =>
      apiGet<BalanceOperation[]>(`/users/${id}/balance-history`, search),
    placeholderData: keepPreviousData,
  });

export const exportUserBalance = (id: string, search: BalanceSearch) =>
  apiGetFile(`/users/${id}/balance-history/export`, search);

export const userLogsQuery = (id: string) =>
  queryOptions({
    queryKey: ["users", "detail", id, "logs"],
    queryFn: () => apiGet<UserLog[]>(`/users/${id}/logs`),
  });

export const userDealsQuery = (id: string, search: DealsSearch) =>
  queryOptions({
    queryKey: ["users", "detail", id, "deals", search],
    queryFn: () => apiGet<UserDeal[]>(`/users/${id}/deals`, search),
    placeholderData: keepPreviousData,
  });

export const userRequisitesQuery = (id: string, search: RequisitesSearch) =>
  queryOptions({
    queryKey: ["users", "detail", id, "requisites", search],
    queryFn: () => apiGet<UserRequisite[]>(`/users/${id}/requisites`, search),
    placeholderData: keepPreviousData,
  });

export const setRequisiteEnabled = (
  userId: string,
  requisiteId: string,
  enabled: boolean,
) =>
  apiPatch<UserRequisite>(`/users/${userId}/requisites/${requisiteId}`, {
    enabled,
  });
