import { queryOptions } from "@tanstack/react-query";
import type { UserRole } from "@/features/users/types";
import { apiGet, apiPost } from "@/lib/api";
import type { Credentials, Otp } from "./schemas";

export type CurrentUser = { id: string; login: string; role: UserRole };

export const currentUserQuery = () =>
  queryOptions({
    queryKey: ["me"],
    queryFn: () => apiGet<CurrentUser>("/me"),
    staleTime: Number.POSITIVE_INFINITY,
  });

export const login = (credentials: Credentials) =>
  apiPost<{ twoFactorRequired: true }>("/auth/login", credentials);

export const verifyOtp = (otp: Otp) => apiPost<CurrentUser>("/auth/2fa", otp);

export const logout = () => apiPost<void>("/auth/logout");
