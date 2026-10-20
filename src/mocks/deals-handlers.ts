import { format, parseISO } from "date-fns";
import { delay } from "msw";
import { HttpResponse, http } from "msw/http";
import { dealStatuses } from "@/features/deals/deal-cells";
import {
  type DealListSortField,
  dealMethodTabs,
} from "@/features/deals/schemas";
import type {
  DealAction,
  DealDetails,
  DealFilterOptions,
  DealList,
} from "@/features/deals/types";
import { paymentMethodLabels } from "@/features/users/payment-methods";
import {
  allBuyouts,
  allDeals,
  cascades,
  dealDetails,
  type MockDeal,
  merchantGroups,
} from "./data/deals";
import { users } from "./data/users";

const has = (value: string, part: string | null) =>
  !part || value.toLowerCase().includes(part.trim().toLowerCase());

function filterDeals(params: URLSearchParams) {
  const get = (key: string) => params.get(key);
  const q = get("q")?.trim().toLowerCase().replace(/^#/, "");
  const amountFrom = get("amountFrom");
  const amountTo = get("amountTo");
  const pool = get("kind") === "buyout" ? allBuyouts : allDeals;
  return pool.filter((d) => {
    const day = format(parseISO(d.createdAt), "yyyy-MM-dd");
    return (
      (!q || d.id.includes(q)) &&
      (!get("from") || day >= (get("from") ?? "")) &&
      (!get("to") || day <= (get("to") ?? "")) &&
      (!get("status") || d.status === get("status")) &&
      (!amountFrom || Number(d.amount) >= Number(amountFrom)) &&
      (!amountTo || Number(d.amount) <= Number(amountTo)) &&
      has(d.processor?.login ?? "", get("trader")) &&
      has(d.cascade, get("cascade")) &&
      has(d.merchantGroup, get("merchantGroup")) &&
      has(d.counterparty, get("counterparty")) &&
      has(`${d.requisite.bank} ${d.requisite.phone}`, get("requisite"))
    );
  });
}

const sortValue: Record<DealListSortField, (d: MockDeal) => string | number> = {
  createdAt: (d) => d.createdAt,
  amount: (d) => Number(d.amount),
};

const notFound = () =>
  HttpResponse.json({ message: "Сделка не найдена" }, { status: 404 });

function update(deal: DealDetails, patch: Partial<DealDetails>) {
  Object.assign(deal, patch);
  const inList = allDeals.find((d) => d.id === deal.id);
  if (inList)
    Object.assign(inList, { status: deal.status, amount: deal.amount });
}

const step = (
  deal: DealDetails,
  kind: DealDetails["history"][number]["kind"],
  text: string,
) =>
  deal.history.unshift({
    id: `${deal.id}-${Date.now()}`,
    createdAt: new Date().toISOString(),
    kind,
    text,
  });

export const dealsHandlers = [
  http.get("/api/deals", async ({ request }) => {
    await delay();
    const params = new URL(request.url).searchParams;
    const found = filterDeals(params);
    const method = params.get("method");
    const items = method
      ? found.filter((d) => d.method === method)
      : [...found];
    const sort = params.get("sort") as DealListSortField | null;
    const direction = params.get("order") === "asc" ? 1 : -1;
    const by = sortValue[sort ?? "createdAt"];
    items.sort((a, b) => {
      const [x, y] = [by(a), by(b)];
      return (x < y ? -1 : x > y ? 1 : 0) * direction;
    });
    const counts = Object.fromEntries([
      ["all", found.length],
      ...dealMethodTabs.map((m) => [
        m,
        found.filter((d) => d.method === m).length,
      ]),
    ]) as DealList["counts"];
    return HttpResponse.json<DealList>({ counts, items: items.slice(0, 100) });
  }),

  http.get("/api/deals/filter-options", async () => {
    await delay();
    return HttpResponse.json<DealFilterOptions>({
      traders: [
        ...new Set(
          allDeals.flatMap((d) => (d.processor ? [d.processor.login] : [])),
        ),
      ].sort(),
      cascades,
      merchantGroups,
    });
  }),

  http.get("/api/deals/export", async ({ request }) => {
    await delay(600);
    const rows = filterDeals(new URL(request.url).searchParams).map((d) =>
      [
        d.id,
        format(parseISO(d.createdAt), "dd.MM.yyyy HH:mm:ss"),
        dealStatuses[d.status].label,
        paymentMethodLabels[d.method],
        d.amount,
        d.processor?.login ?? "",
        d.merchant.name,
        d.cascade,
        d.requisite.bank,
      ].join(";"),
    );
    const header =
      "ID;Дата;Статус;Метод;Сумма, RUB;Обработчик;Мерчант;Каскад;Банк";
    return new HttpResponse(`﻿${[header, ...rows].join("\n")}`, {
      headers: { "Content-Type": "text/csv; charset=utf-8" },
    });
  }),

  http.get("/api/deals/:id", async ({ params }) => {
    await delay();
    const deal = dealDetails(String(params.id));
    return deal ? HttpResponse.json(deal) : notFound();
  }),

  http.post("/api/deals/:id/actions", async ({ params, request }) => {
    await delay(600);
    const deal = dealDetails(String(params.id));
    if (!deal) return notFound();
    const { action } = (await request.json()) as { action: DealAction };
    if (action === "complete") {
      update(deal, {
        status: "completed",
        deadline: null,
        fees: {
          ...deal.fees,
          leads: { amount: (Number(deal.send) * 0.005).toFixed(2), count: 1 },
        },
      });
      step(deal, "completed", "Администратор закрыл сделку");
    } else if (action === "dispute") {
      update(deal, { status: "appeal" });
      step(deal, "appeal", "Администратор открыл спор");
    } else if (action === "cancel") {
      update(deal, { status: "cancelled", deadline: null });
      step(deal, "cancelled", "Администратор отменил завершённую сделку");
    }
    return HttpResponse.json(deal);
  }),

  http.patch("/api/deals/:id", async ({ params, request }) => {
    await delay();
    const deal = dealDetails(String(params.id));
    if (!deal) return notFound();
    const { amount } = (await request.json()) as { amount: string };
    const value = Number(amount).toFixed(2);
    step(
      deal,
      "amountChanged",
      `Сумма изменена: ${deal.amount} → ${value} RUB`,
    );
    update(deal, {
      amount: value,
      receive: value,
      send: (Number(value) / Number(deal.rate)).toFixed(1),
    });
    return HttpResponse.json(deal);
  }),

  http.post("/api/deals/:id/trader", async ({ params, request }) => {
    await delay();
    const deal = dealDetails(String(params.id));
    if (!deal) return notFound();
    const { traderId } = (await request.json()) as { traderId: string };
    const trader = users.find((u) => u.id === traderId);
    if (!trader) {
      return HttpResponse.json(
        { message: "Трейдер не найден" },
        { status: 404 },
      );
    }
    update(deal, {
      processor: { id: trader.id, login: trader.login },
      status: deal.status === "pending" ? "active" : deal.status,
    });
    step(
      deal,
      "traderAssigned",
      `Администратор назначил трейдера ${trader.login}`,
    );
    return HttpResponse.json(deal);
  }),

  http.post("/api/deals/:id/dispute", async ({ params, request }) => {
    await delay(800);
    const deal = dealDetails(String(params.id));
    if (!deal) return notFound();
    const form = await request.formData();
    const receipt = form.get("receipt");
    if (!(receipt instanceof File)) {
      return HttpResponse.json({ message: "Загрузите чек" }, { status: 400 });
    }
    update(deal, { status: "appeal" });
    deal.files.unshift({
      id: `${deal.id}-${Date.now()}`,
      name: receipt.name,
      url: null,
    });
    step(
      deal,
      "appeal",
      `Администратор открыл спор, оплачено ${form.get("amount")} RUB`,
    );
    return HttpResponse.json(deal);
  }),
];
