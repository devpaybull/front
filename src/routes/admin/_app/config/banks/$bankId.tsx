import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { TableMessage } from "@/components/table/table-message";
import { Button } from "@/components/ui/button";
import { bankQuery } from "@/features/banks/api";
import { BankPage } from "@/features/banks/bank-page";
import type { Bank } from "@/features/banks/types";
import { ApiError, errorMessage } from "@/lib/api";
import { queryClient } from "@/lib/query-client";

export const Route = createFileRoute("/admin/_app/config/banks/$bankId")({
  staticData: {
    title: "Банк",
    heading: (_params, bank) => (bank as Bank | undefined)?.name ?? "Банк",
    subtitle: "Информация о банке",
    menuItem: "/admin/config/banks",
  },
  loader: ({ params }) =>
    queryClient
      .ensureQueryData(bankQuery(params.bankId))
      .catch(() => undefined),
  component: BankRoute,
});

function BankRoute() {
  const { bankId } = Route.useParams();
  const { data, isPending, error, refetch } = useQuery(bankQuery(bankId));

  if (isPending) return <TableMessage>Загрузка…</TableMessage>;
  if (error) {
    return (
      <TableMessage>
        {error instanceof ApiError && error.status === 404
          ? "Банк не найден"
          : errorMessage(error)}
        <Button variant="secondary" onClick={() => refetch()}>
          Повторить
        </Button>
      </TableMessage>
    );
  }
  return <BankPage bank={data} />;
}
