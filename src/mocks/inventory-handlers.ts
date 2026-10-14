import { delay } from "msw";
import { HttpResponse, http } from "msw/http";
import type {
  InventoryList,
  InventoryStats,
  RequisiteKind,
} from "@/features/inventory/types";
import { filterOptions, traders } from "./data/inventory";

export const inventoryHandlers = [
  http.get("/api/inventory/filter-options", async () => {
    await delay();
    return HttpResponse.json(filterOptions);
  }),

  http.get("/api/inventory/stats", async ({ request }) => {
    await delay();
    const query = new URL(request.url).searchParams.toString();
    const k =
      1 - ([...query].reduce((sum, c) => sum + c.charCodeAt(0), 0) % 60) / 100;
    const stats: InventoryStats = {
      availableRequisites: Math.round(500 * k),
      requisitesInWork: Math.round(150 * k),
      counterpartiesOnRequisites: { used: Math.round(200 * k), total: 400 },
      counterpartiesWithoutRequisite: Math.round(5 * k),
    };
    return HttpResponse.json(stats);
  }),

  http.get("/api/inventory", async ({ request }) => {
    await delay();
    const kind = new URL(request.url).searchParams.get(
      "kind",
    ) as RequisiteKind | null;

    const all = traders.flatMap((t) => t.requisites);
    const counts: InventoryList["counts"] = {
      all: all.length,
      card: all.filter((r) => r.kind === "card").length,
      sbp: all.filter((r) => r.kind === "sbp").length,
      mobile: all.filter((r) => r.kind === "mobile").length,
      counterparty: all.filter((r) => r.kind === "counterparty").length,
    };

    const items = kind
      ? traders
          .map((t) => ({
            ...t,
            requisites: t.requisites.filter((r) => r.kind === kind),
          }))
          .filter((t) => t.requisites.length > 0)
      : traders;

    return HttpResponse.json<InventoryList>({ counts, items });
  }),
];
