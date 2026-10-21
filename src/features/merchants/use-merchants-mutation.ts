import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Merchant, MerchantGroup, MerchantList } from "./types";

export function useMerchantsMutation<TVars>(
  mutationFn: (vars: TVars) => Promise<unknown>,
  apply: (list: MerchantList, vars: TVars) => MerchantList,
) {
  const client = useQueryClient();
  const lists = { queryKey: ["merchants", "list"] };

  return useMutation({
    mutationFn,
    onMutate: async (vars) => {
      await client.cancelQueries(lists);
      const before = client.getQueriesData<MerchantList>(lists);
      client.setQueriesData<MerchantList>(
        lists,
        (list) => list && apply(list, vars),
      );
      return { before };
    },
    onError: (_error, _vars, context) => {
      for (const [key, list] of context?.before ?? [])
        client.setQueryData(key, list);
    },
    onSettled: () => client.invalidateQueries({ queryKey: ["merchants"] }),
  });
}

export function mapMerchant(
  list: MerchantList,
  id: string,
  change: (merchant: Merchant) => Merchant,
): MerchantList {
  return {
    items: list.items.map((item) =>
      item.kind === "merchant"
        ? item.id === id
          ? { ...item, ...change(item) }
          : item
        : {
            ...item,
            merchants: item.merchants.map((m) => (m.id === id ? change(m) : m)),
          },
    ),
  };
}

export function mapGroup(
  list: MerchantList,
  id: string,
  change: (group: MerchantGroup) => MerchantGroup,
): MerchantList {
  return {
    items: list.items.map((item) =>
      item.kind === "group" && item.id === id
        ? { ...item, ...change(item) }
        : item,
    ),
  };
}
