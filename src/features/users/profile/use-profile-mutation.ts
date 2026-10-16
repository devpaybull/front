import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userQuery } from "../api";
import type { UserProfile } from "../types";

export function useProfileMutation<Variables = void>(
  userId: string,
  mutationFn: (variables: Variables) => Promise<UserProfile>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: (profile) => {
      queryClient.setQueryData(userQuery(userId).queryKey, profile);
      queryClient.invalidateQueries({
        queryKey: ["users"],
        predicate: (query) => query.queryKey[2] !== userId,
      });
    },
  });
}
