import { useIsFetching } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback } from "react";
import { SearchInput } from "@/components/ui/search-input";
import { messagesQuery } from "@/features/messages/api";
import { MessageFiltersPopover } from "@/features/messages/message-filters";
import { MessagesTable } from "@/features/messages/messages-table";
import {
  type MessagesSearch,
  messagesSearchSchema,
} from "@/features/messages/schemas";
import { useLiveSearch } from "@/hooks/use-live-search";
import { queryClient } from "@/lib/query-client";

const searchHint = "Поиск по ID или тексту сообщения";

export const Route = createFileRoute("/admin/_app/users/messages")({
  staticData: {
    title: "Пользователи",
    subtitle: "Управление сообщениями",
  },
  validateSearch: messagesSearchSchema,
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) => {
    void queryClient.prefetchQuery(messagesQuery(deps));
  },
  component: MessagesPage,
});

function MessagesPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const fetching = useIsFetching({ queryKey: ["messages", "list"] }) > 0;

  const setSearch = useCallback(
    (patch: Partial<MessagesSearch>) =>
      navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true }),
    [navigate],
  );
  const [text, setText] = useLiveSearch(search.q, (q) => setSearch({ q }));
  const { from, to, trader, device, sender, hideUnknown, deal } = search;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-4">
        <SearchInput
          className="flex-1"
          value={text}
          onChange={(event) => setText(event.target.value)}
          loading={fetching}
          placeholder={searchHint}
          aria-label={searchHint}
        />
        <span aria-hidden className="h-7 w-px bg-border/80" />
        <MessageFiltersPopover
          value={{ from, to, trader, device, sender, hideUnknown, deal }}
          onApply={(filters) =>
            setSearch({
              from: undefined,
              to: undefined,
              trader: undefined,
              device: undefined,
              sender: undefined,
              hideUnknown: undefined,
              deal: undefined,
              ...filters,
            })
          }
        />
      </div>
      <MessagesTable search={search} onChange={setSearch} />
    </div>
  );
}
