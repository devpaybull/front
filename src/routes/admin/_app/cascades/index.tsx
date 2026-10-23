import { useIsFetching } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback } from "react";
import { FilterSelect } from "@/components/filter-select";
import { SearchInput } from "@/components/ui/search-input";
import { cascadesQuery } from "@/features/cascades/api";
import { CascadesTable } from "@/features/cascades/cascades-table";
import {
  type CascadesSearch,
  cascadesSearchSchema,
} from "@/features/cascades/schemas";
import { useLiveSearch } from "@/hooks/use-live-search";
import { queryClient } from "@/lib/query-client";

const searchHint = "Поиск по названию или ID каскада";
const statusOptions = [
  { value: "on", label: "Включены" },
  { value: "off", label: "Выключены" },
];

export const Route = createFileRoute("/admin/_app/cascades/")({
  staticData: { title: "Каскады", subtitle: "Управление каскадами" },
  validateSearch: cascadesSearchSchema,
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) => {
    void queryClient.prefetchQuery(cascadesQuery(deps));
  },
  component: CascadesPage,
});

function CascadesPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const fetching = useIsFetching({ queryKey: ["cascades", "list"] }) > 0;

  const setSearch = useCallback(
    (patch: Partial<CascadesSearch>) =>
      navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true }),
    [navigate],
  );
  const [text, setText] = useLiveSearch(search.q, (q) => setSearch({ q }));

  return (
    <div className="flex flex-col">
      <div className="mb-5 flex items-center gap-4">
        <SearchInput
          className="flex-1"
          value={text}
          onChange={(event) => setText(event.target.value)}
          onClear={() => setText("")}
          loading={fetching}
          placeholder={searchHint}
          aria-label={searchHint}
        />
        <span aria-hidden className="h-7 w-px bg-border/80" />
        <FilterSelect
          label="Статус:"
          allLabel="Все"
          options={statusOptions}
          value={search.status}
          onChange={(status) =>
            setSearch({ status: status as CascadesSearch["status"] })
          }
          className="w-[210px]"
        />
      </div>
      <CascadesTable search={search} onChange={setSearch} />
    </div>
  );
}
