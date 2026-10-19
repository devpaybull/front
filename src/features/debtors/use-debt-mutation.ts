import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDebtMutation<T>(save: (values: T) => Promise<unknown>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: save,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["debts"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
