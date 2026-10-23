import { endOfDay, parseISO, startOfDay } from "date-fns";
import { delay } from "msw";
import { HttpResponse, http } from "msw/http";
import type {
  CascadeRequestSortField,
  CascadeSortField,
} from "@/features/cascades/schemas";
import type {
  Cascade,
  CascadeList,
  CascadeRequest,
  CascadeRequestFilterOptions,
  CascadeRequestList,
} from "@/features/cascades/types";
import { paymentMethodLabels } from "@/features/users/payment-methods";
import { cascadeBanks, cascadeRequests, cascades } from "./data/cascades";

const cascadeSort: Record<CascadeSortField, (c: Cascade) => number> = {
  priority: (c) => c.priority,
  volume: (c) => Number(c.volumeToday.rub),
  dealsPerMinute: (c) => c.dealsPerMinute,
  merchants: (c) => c.merchants.count,
  balance: (c) => Number(c.balance.total),
};

const requestSort: Record<
  CascadeRequestSortField,
  (r: CascadeRequest) => string | number
> = {
  createdAt: (r) => r.createdAt,
  amount: (r) => Number(r.amount),
  bank: (r) => r.bank ?? "",
  responseMs: (r) => r.responseMs,
};

function sorted<T>(
  items: T[],
  params: URLSearchParams,
  by: (item: T) => string | number,
) {
  const direction = params.get("order") === "asc" ? 1 : -1;
  return items.sort((a, b) => {
    const [x, y] = [by(a), by(b)];
    return (x < y ? -1 : x > y ? 1 : 0) * direction;
  });
}

function filterRequests(params: URLSearchParams) {
  const q = params.get("q")?.trim().toLowerCase();
  const from = params.get("from");
  const to = params.get("to");
  const cascade = params.get("cascade");
  const amountFrom = params.get("amountFrom");
  const amountTo = params.get("amountTo");
  const bank = params.get("bank");
  const method = params.get("method");
  return cascadeRequests.filter(
    (r) =>
      (!q ||
        [r.id, r.cascade.id, r.cascade.name].some((v) =>
          v.toLowerCase().includes(q),
        )) &&
      (!from || parseISO(r.createdAt) >= startOfDay(parseISO(from))) &&
      (!to || parseISO(r.createdAt) <= endOfDay(parseISO(to))) &&
      (!cascade || r.cascade.name === cascade) &&
      (!amountFrom || Number(r.amount) >= Number(amountFrom)) &&
      (!amountTo || Number(r.amount) <= Number(amountTo)) &&
      (!bank || r.bank === bank) &&
      (!method || r.method === method),
  );
}

export const cascadesHandlers = [
  http.get("/api/cascades", async ({ request }) => {
    await delay();
    const params = new URL(request.url).searchParams;
    const q = params.get("q")?.trim().toLowerCase();
    const status = params.get("status");
    const items = cascades.filter(
      (c) =>
        (!q || [c.id, c.name].some((v) => v.toLowerCase().includes(q))) &&
        (!status || c.enabled === (status === "on")),
    );
    const sort = (params.get("sort") as CascadeSortField | null) ?? "priority";
    const by = cascadeSort[sort];
    if (!params.get("sort")) params.set("order", "asc");
    return HttpResponse.json<CascadeList>({
      items: sorted([...items], params, by),
    });
  }),

  http.patch("/api/cascades/:id", async ({ params, request }) => {
    await delay();
    const cascade = cascades.find((c) => c.id === params.id);
    if (!cascade)
      return HttpResponse.json(
        { message: "Каскад не найден" },
        { status: 404 },
      );
    const patch = (await request.json()) as {
      enabled?: boolean;
      priority?: number;
    };
    if (patch.enabled !== undefined) cascade.enabled = patch.enabled;
    if (patch.priority !== undefined) {
      const ordered = cascades
        .filter((c) => c !== cascade)
        .sort((a, b) => a.priority - b.priority);
      const at = Math.min(Math.max(patch.priority, 1), cascades.length) - 1;
      ordered.splice(at, 0, cascade);
      ordered.forEach((c, n) => {
        c.priority = n + 1;
      });
    }
    return new HttpResponse(null, { status: 204 });
  }),

  http.get("/api/cascade-requests", async ({ request }) => {
    await delay();
    const params = new URL(request.url).searchParams;
    const found = filterRequests(params);
    const result = params.get("result");
    const items = result
      ? found.filter((r) => r.result === result)
      : [...found];
    const sort = params.get("sort") as CascadeRequestSortField | null;
    return HttpResponse.json<CascadeRequestList>({
      items: sorted(items, params, requestSort[sort ?? "createdAt"]),
      counts: {
        all: found.length,
        success: found.filter((r) => r.result === "success").length,
        error: found.filter((r) => r.result === "error").length,
      },
    });
  }),

  http.get("/api/cascade-requests/filter-options", async () => {
    await delay();
    const methods = [...new Set(cascadeRequests.map((r) => r.method))];
    return HttpResponse.json<CascadeRequestFilterOptions>({
      cascades: cascades.map((c) => c.name),
      banks: cascadeBanks,
      methods: methods.map((value) => ({
        value,
        label: paymentMethodLabels[value],
      })),
    });
  }),
];
