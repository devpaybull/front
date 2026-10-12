import { ApiError } from "@/lib/api";
import { queryClient } from "@/lib/query-client";
import { currentUserQuery } from "./api";

export async function getSessionUser() {
  try {
    return await queryClient.ensureQueryData(currentUserQuery());
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null;
    throw error;
  }
}
