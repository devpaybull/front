import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import type { MessagesSearch } from "./schemas";
import type { MessageFilterOptions, MessageList } from "./types";

export const messagesQuery = (search: MessagesSearch) =>
  queryOptions({
    queryKey: ["messages", "list", search],
    queryFn: () => apiGet<MessageList>("/messages", search),
    placeholderData: keepPreviousData,
  });

export const messageFilterOptionsQuery = () =>
  queryOptions({
    queryKey: ["messages", "filter-options"],
    queryFn: () => apiGet<MessageFilterOptions>("/messages/filter-options"),
  });
