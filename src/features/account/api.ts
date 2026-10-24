import { queryOptions } from "@tanstack/react-query";
import { apiDelete, apiGet, apiPost } from "@/lib/api";
import type { AccountActivity, AccountProfile, TelegramBot } from "./types";

export const accountProfileQuery = () =>
  queryOptions({
    queryKey: ["me", "profile"],
    queryFn: () => apiGet<AccountProfile>("/me/profile"),
  });

export const accountBotsQuery = () =>
  queryOptions({
    queryKey: ["me", "bots"],
    queryFn: () => apiGet<TelegramBot[]>("/me/bots"),
  });

export const accountActivityQuery = () =>
  queryOptions({
    queryKey: ["me", "activity"],
    queryFn: () => apiGet<AccountActivity[]>("/me/activity"),
  });

export const changePassword = (current: string, next: string) =>
  apiPost<void>("/me/password", { current, next });

export const bindBot = (id: string) =>
  apiPost<{ url: string }>(`/me/bots/${id}/binding`);

export const unbindBot = (id: string) =>
  apiDelete<void>(`/me/bots/${id}/binding`);
