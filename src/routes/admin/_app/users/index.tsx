import { useIsFetching } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback } from "react";
import { SearchInput } from "@/components/ui/search-input";
import { compactTables } from "@/features/users/compact-user-row";
import { type UsersSearch, usersSearchSchema } from "@/features/users/schemas";
import { UsersTable } from "@/features/users/users-table";
import { useLiveSearch } from "@/hooks/use-live-search";

export const Route = createFileRoute("/admin/_app/users/")({
  staticData: { title: "Пользователи", subtitle: "Управление пользователями" },
  validateSearch: usersSearchSchema,
  component: UsersPage,
});

function UsersPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const fetching = useIsFetching({ queryKey: ["users", "list"] }) > 0;

  const setSearch = useCallback(
    (patch: Partial<UsersSearch>) =>
      navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true }),
    [navigate],
  );

  const [text, setText] = useLiveSearch(search.q, (q) => setSearch({ q }));
  const searchHint =
    (search.role && compactTables[search.role]?.searchHint) ??
    "Поиск по логину/telegram или токену";

  return (
    <div className="flex flex-col gap-5">
      <SearchInput
        value={text}
        onChange={(event) => setText(event.target.value)}
        loading={fetching}
        placeholder={searchHint}
        aria-label={searchHint}
      />
      <UsersTable
        search={search}
        liveQuery={text.trim()}
        onChange={setSearch}
      />
    </div>
  );
}
