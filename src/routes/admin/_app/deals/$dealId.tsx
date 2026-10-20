import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { TableMessage } from "@/components/table/table-message";
import { Button } from "@/components/ui/button";
import { dealQuery } from "@/features/deals/api";
import { DealPage } from "@/features/deals/deal-page";
import { ApiError, errorMessage } from "@/lib/api";
import { shortId } from "@/lib/format";
import { queryClient } from "@/lib/query-client";

export const Route = createFileRoute("/admin/_app/deals/$dealId")({
  staticData: {
    title: "Сделка",
    heading: ({ dealId }) => `Сделка ${shortId(dealId, 5, 7)}`,
    subtitle: "Управление сделкой",
    menuItem: "/admin/deals",
  },
  loader: ({ params }) => {
    void queryClient.prefetchQuery(dealQuery(params.dealId));
  },
  component: DealRoute,
});

function DealRoute() {
  const { dealId } = Route.useParams();
  const { data, isPending, error, refetch } = useQuery(dealQuery(dealId));

  if (isPending) return <TableMessage>Загрузка…</TableMessage>;
  if (error) {
    return (
      <TableMessage>
        {error instanceof ApiError && error.status === 404
          ? "Сделка не найдена"
          : errorMessage(error)}
        <Button variant="secondary" onClick={() => refetch()}>
          Повторить
        </Button>
      </TableMessage>
    );
  }
  return <DealPage deal={data} />;
}
