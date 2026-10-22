import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { TableMessage } from "@/components/table/table-message";
import { Button } from "@/components/ui/button";
import { counterpartyQuery } from "@/features/counterparties/api";
import { CounterpartyPage } from "@/features/counterparties/counterparty-page";
import { ApiError, errorMessage } from "@/lib/api";
import { queryClient } from "@/lib/query-client";

export const Route = createFileRoute(
  "/admin/_app/merchants/counterparties/$counterpartyId",
)({
  staticData: {
    title: "Мерчанты",
    subtitle: "Управление контрагентами",
    menuItem: "/admin/merchants/counterparties",
  },
  loader: ({ params }) => {
    void queryClient.prefetchQuery(counterpartyQuery(params.counterpartyId));
  },
  component: CounterpartyRoute,
});

function CounterpartyRoute() {
  const { counterpartyId } = Route.useParams();
  const { data, isPending, error, refetch } = useQuery(
    counterpartyQuery(counterpartyId),
  );

  if (isPending) return <TableMessage>Загрузка…</TableMessage>;
  if (error) {
    return (
      <TableMessage>
        {error instanceof ApiError && error.status === 404
          ? "Контрагент не найден"
          : errorMessage(error)}
        <Button variant="secondary" onClick={() => refetch()}>
          Повторить
        </Button>
      </TableMessage>
    );
  }
  return <CounterpartyPage counterparty={data} />;
}
