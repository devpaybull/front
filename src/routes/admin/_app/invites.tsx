import { createFileRoute } from "@tanstack/react-router";
import { useCallback } from "react";
import { InvitesManagement } from "@/features/invites/invites-management";
import { InvitesTable } from "@/features/invites/invites-table";
import {
  type InvitesSearch,
  invitesSearchSchema,
} from "@/features/invites/schemas";
import { useLiveSearch } from "@/hooks/use-live-search";

export const Route = createFileRoute("/admin/_app/invites")({
  staticData: { title: "Инвайты", subtitle: "Управление доступом" },
  validateSearch: invitesSearchSchema,
  component: InvitesPage,
});

function InvitesPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  const setSearch = useCallback(
    (patch: Partial<InvitesSearch>) =>
      navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true }),
    [navigate],
  );

  const [text, setText] = useLiveSearch(search.q, (q) => setSearch({ q }));

  return (
    <div className="flex flex-col gap-5">
      <InvitesManagement text={text} onTextChange={setText} />
      <InvitesTable
        search={search}
        liveQuery={text.trim()}
        onChange={setSearch}
      />
    </div>
  );
}
