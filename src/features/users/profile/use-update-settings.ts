import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateUserSettings, userQuery } from "../api";
import type { UserSettings } from "../types";

export function useUpdateSettings(userId: string) {
  const queryClient = useQueryClient();
  const { queryKey } = userQuery(userId);
  const mutationKey = ["users", "settings", userId];

  return useMutation({
    mutationKey,
    mutationFn: (patch: Partial<UserSettings>) =>
      updateUserSettings(userId, patch),
    onMutate: async (patch) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData(queryKey);
      queryClient.setQueryData(
        queryKey,
        (user) => user && { ...user, settings: { ...user.settings, ...patch } },
      );
      return { previous };
    },
    onError: (_error, _patch, context) => {
      queryClient.setQueryData(queryKey, context?.previous);
    },
    onSettled: () => {
      if (queryClient.isMutating({ mutationKey }) === 1) {
        queryClient.invalidateQueries({ queryKey });
      }
    },
  });
}
