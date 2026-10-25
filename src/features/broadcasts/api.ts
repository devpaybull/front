import { queryOptions } from "@tanstack/react-query";
import { apiGet, apiPost } from "@/lib/api";
import type { Broadcast, BroadcastList } from "./types";

export const broadcastsQuery = () =>
  queryOptions({
    queryKey: ["broadcasts"],
    queryFn: () => apiGet<BroadcastList>("/broadcasts"),
    refetchInterval: (query) =>
      query.state.data?.items.some(
        (b) => b.status === "queued" || b.status === "sending",
      )
        ? 2000
        : false,
  });

export const sendBroadcast = (text: string) =>
  apiPost<Broadcast>("/broadcasts", { text });
