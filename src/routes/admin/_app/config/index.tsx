import { useIsFetching } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback } from "react";
import { SearchInput } from "@/components/ui/search-input";
import { settingsQuery } from "@/features/platform-settings/api";
import {
  type SettingsSearch,
  settingsSearchSchema,
} from "@/features/platform-settings/schemas";
import {
  SettingsStats,
  SettingsTable,
} from "@/features/platform-settings/settings-table";
import { useLiveSearch } from "@/hooks/use-live-search";
import { queryClient } from "@/lib/query-client";

const searchHint = "Поиск по названию, ключу или значению";

export const Route = createFileRoute("/admin/_app/config/")({
  staticData: { title: "Конфигурация", subtitle: "Основные настройки" },
  validateSearch: settingsSearchSchema,
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) => {
    void queryClient.prefetchQuery(settingsQuery(deps));
  },
  component: SettingsPage,
});

function SettingsPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const fetching =
    useIsFetching({ queryKey: ["platform-settings", "list"] }) > 0;

  const setSearch = useCallback(
    (patch: Partial<SettingsSearch>) =>
      navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true }),
    [navigate],
  );
  const [text, setText] = useLiveSearch(search.q, (q) => setSearch({ q }));

  return (
    <div className="flex flex-col">
      <SettingsStats search={search} />
      <hr className="my-[30px] border-border/80" />
      <SearchInput
        className="mb-5"
        value={text}
        onChange={(event) => setText(event.target.value)}
        onClear={() => setText("")}
        loading={fetching}
        placeholder={searchHint}
        aria-label={searchHint}
      />
      <SettingsTable search={search} onChange={setSearch} />
    </div>
  );
}
