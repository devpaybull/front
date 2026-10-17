import { useMutation, useQueryClient } from "@tanstack/react-query";
import { setRequisiteEnabled } from "../../api";
import type { UserRequisite } from "../../types";

export function useToggleRequisite(userId: string) {
  const queryClient = useQueryClient();
  const queryKey = ["users", "detail", userId, "requisites"];
  const mutationKey = ["users", "requisite-enabled", userId];

  return useMutation({
    mutationKey,
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      setRequisiteEnabled(userId, id, enabled),
    onMutate: async ({ id, enabled }) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueriesData<UserRequisite[]>({
        queryKey,
      });
      queryClient.setQueriesData<UserRequisite[]>({ queryKey }, (list) =>
        list?.map((r) => (r.id === id ? { ...r, enabled } : r)),
      );
      return { previous };
    },
    onError: (_error, _variables, context) => {
      for (const [key, list] of context?.previous ?? []) {
        queryClient.setQueryData(key, list);
      }
    },
    onSettled: () => {
      if (queryClient.isMutating({ mutationKey }) === 1) {
        queryClient.invalidateQueries({ queryKey });
      }
    },
  });
}
