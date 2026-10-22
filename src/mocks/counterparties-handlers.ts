import { delay } from "msw";
import { HttpResponse, http } from "msw/http";
import type {
  CounterpartyFilters,
  CounterpartySortField,
} from "@/features/counterparties/schemas";
import type {
  BindChannel,
  BindType,
  Counterparty,
  CounterpartyDetails,
  CounterpartyEvents,
  CounterpartyFilterOptions,
  CounterpartyList,
  CounterpartyRequisite,
  CounterpartyStats,
} from "@/features/counterparties/types";
import {
  bind,
  counterparties,
  kaRequisites,
  type MockCounterparty,
} from "./data/counterparties";

const sortValue: Record<
  CounterpartySortField,
  (c: Counterparty) => string | number
> = {
  id: (c) => c.id,
  activity: (c) => c.activity.paid,
  conversion: (c) => c.conversion,
  averageCheck: (c) => Number(c.averageCheck),
  week: (c) => Number(c.deposits.week),
  month: (c) => Number(c.deposits.month),
  all: (c) => Number(c.deposits.all),
};

const ranges: [
  keyof CounterpartyFilters,
  keyof CounterpartyFilters,
  (c: Counterparty) => number,
][] = [
  ["vol30From", "vol30To", (c) => Number(c.deposits.month)],
  ["vol60From", "vol60To", (c) => Number(c.deposits.month) * 1.9],
  ["vol90From", "vol90To", (c) => Number(c.deposits.month) * 2.7],
  ["allFrom", "allTo", (c) => Number(c.deposits.all)],
  ["paid30From", "paid30To", (c) => c.activity.paid],
  ["requests30From", "requests30To", (c) => c.activity.requests],
];

const has = (value: string, q: string) => value.toLowerCase().includes(q);
const yes = (param: string | null, value: boolean) =>
  param === null || (param === "yes") === value;

function filter(params: URLSearchParams) {
  const q = params.get("q")?.trim().toLowerCase();
  const trader = params.get("trader")?.trim().toLowerCase();
  const merchant = params.get("merchant")?.trim().toLowerCase();
  const requisite = params.get("requisite")?.trim().toLowerCase();
  return counterparties.filter(
    (c) =>
      (!q ||
        has(c.id, q) ||
        has(c.merchant.name, q) ||
        c.requisites.some(
          (r) => has(r.trader.login, q) || has(r.value, q) || has(r.holder, q),
        )) &&
      (!trader || c.requisites.some((r) => has(r.trader.login, trader))) &&
      (!merchant || has(c.merchant.name, merchant)) &&
      (!requisite ||
        c.requisites.some(
          (r) => has(r.value, requisite) || has(r.holder, requisite),
        )) &&
      yes(params.get("blacklisted"), c.blacklisted) &&
      yes(params.get("autoEnableBlocked"), c.autoEnableBlocked) &&
      yes(params.get("bound"), c.requisites.length > 0) &&
      ranges.every(([from, to, value]) => {
        const [min, max] = [params.get(from), params.get(to)];
        return (
          (min === null || value(c) >= Number(min)) &&
          (max === null || value(c) <= Number(max))
        );
      }),
  );
}

const row = ({
  createdAt: _c,
  lastDepositAt: _l,
  requisites: _r,
  events: _e,
  ...counterparty
}: MockCounterparty): Counterparty => counterparty;

const details = ({ events: _e, ...c }: MockCounterparty): CounterpartyDetails =>
  c;

const notFound = () =>
  HttpResponse.json({ message: "Контрагент не найден" }, { status: 404 });

const find = (id: unknown) => counterparties.find((c) => c.id === id);

function syncLatest(c: MockCounterparty) {
  c.requisites.sort((a, b) => b.boundAt.localeCompare(a.boundAt));
  c.requisite = c.requisites[0] ?? null;
}

export const counterpartiesHandlers = [
  http.get("/api/counterparties", async ({ request }) => {
    await delay();
    const params = new URL(request.url).searchParams;
    const found = filter(params);
    const status = params.get("status");
    const items = status
      ? found.filter((c) => c.enabled === (status === "active"))
      : [...found];
    const sort = params.get("sort") as CounterpartySortField | null;
    if (sort) {
      const direction = params.get("order") === "asc" ? 1 : -1;
      const by = sortValue[sort];
      items.sort((a, b) => {
        const [x, y] = [by(a), by(b)];
        return (x < y ? -1 : x > y ? 1 : 0) * direction;
      });
    }
    return HttpResponse.json<CounterpartyList>({
      items: items.map(row),
      counts: {
        all: found.length,
        active: found.filter((c) => c.enabled).length,
        disabled: found.filter((c) => !c.enabled).length,
      },
    });
  }),

  http.get("/api/counterparties/filter-options", async () => {
    await delay();
    const unique = (values: string[]) => [...new Set(values)].sort();
    return HttpResponse.json<CounterpartyFilterOptions>({
      traders: unique(
        counterparties.flatMap((c) => c.requisites.map((r) => r.trader.login)),
      ),
      merchants: unique(counterparties.map((c) => c.merchant.name)),
    });
  }),

  http.get("/api/counterparties/:id", async ({ params }) => {
    await delay();
    const c = find(params.id);
    return c ? HttpResponse.json(details(c)) : notFound();
  }),

  http.get("/api/counterparties/:id/stats", async ({ params, request }) => {
    await delay();
    const c = find(params.id);
    if (!c) return notFound();
    const method = new URL(request.url).searchParams.get("method");
    const share = method
      ? 0.15 +
        ([...method].reduce((s, ch) => s + ch.charCodeAt(0), 0) % 5) * 0.1
      : 1;
    const part = (n: number) => Math.round(n * share);
    const money = (v: string) => (Number(v) * share).toFixed(2);
    const { requests, deals, paid } = c.activity;
    return HttpResponse.json<CounterpartyStats>({
      conversion: requests
        ? Math.round((part(paid) / part(requests)) * 1000) / 10
        : 0,
      paidDeals: part(paid),
      totalDeals: part(deals),
      averageCheck: c.averageCheck,
      lastDepositAt: c.lastDepositAt,
      funnel: {
        requests: part(requests),
        deals: part(deals),
        paid: part(paid),
      },
      volume: {
        week: money(c.deposits.week),
        month: money(c.deposits.month),
        all: money(c.deposits.all),
      },
    });
  }),

  http.get("/api/counterparties/:id/events", async ({ params, request }) => {
    await delay();
    const c = find(params.id);
    if (!c) return notFound();
    const isRequisite = (kind: string) => kind.startsWith("requisite");
    const tab = new URL(request.url).searchParams.get("tab");
    const requisites = c.events.filter((e) => isRequisite(e.kind));
    const deals = c.events.filter((e) => !isRequisite(e.kind));
    return HttpResponse.json<CounterpartyEvents>({
      items: tab === "requisites" ? requisites : deals,
      counts: { deals: deals.length, requisites: requisites.length },
    });
  }),

  http.patch("/api/counterparties/:id", async ({ params, request }) => {
    await delay();
    const c = find(params.id);
    if (!c) return notFound();
    const patch = (await request.json()) as Partial<
      Pick<Counterparty, "enabled" | "blacklisted" | "autoEnableBlocked">
    >;
    Object.assign(c, patch);
    if (patch.blacklisted) c.enabled = false;
    else if (patch.enabled && c.blacklisted) c.blacklisted = false;
    return new HttpResponse(null, { status: 204 });
  }),

  http.get("/api/counterparty-requisites", async ({ request }) => {
    await delay();
    const q = new URL(request.url).searchParams
      .get("q")
      ?.trim()
      .toLowerCase()
      .replace(/\s/g, "");
    const found = q
      ? kaRequisites.filter((r) =>
          [r.value, r.holder, r.bank].some((v) =>
            v.toLowerCase().replace(/\s/g, "").includes(q),
          ),
        )
      : kaRequisites;
    return HttpResponse.json<CounterpartyRequisite[]>(found.slice(0, 20));
  }),

  http.post(
    "/api/counterparties/:id/requisites",
    async ({ params, request }) => {
      await delay();
      const c = find(params.id);
      if (!c) return notFound();
      const body = (await request.json()) as {
        requisiteId: string;
        bindType: BindType;
        channel: BindChannel;
      };
      const requisite = kaRequisites.find((r) => r.id === body.requisiteId);
      if (!requisite)
        return HttpResponse.json(
          { message: "Реквизит не найден" },
          { status: 404 },
        );
      if (c.requisites.some((r) => r.id === requisite.id))
        return HttpResponse.json(
          { message: "Этот реквизит уже привязан" },
          { status: 409 },
        );
      const binding = {
        ...bind(requisite, body.bindType, new Date()),
        channel: body.channel,
      };
      c.requisites.push(binding);
      syncLatest(c);
      c.events.unshift({
        id: `${c.id}-${binding.bindingId}`,
        at: binding.boundAt,
        kind: "requisiteBound",
        trader: requisite.trader,
        requisite: { bank: requisite.bank, value: requisite.value },
      });
      return new HttpResponse(null, { status: 201 });
    },
  ),

  http.put(
    "/api/counterparties/:id/requisites/:bindingId",
    async ({ params, request }) => {
      await delay();
      const c = find(params.id);
      const index =
        c?.requisites.findIndex((r) => r.bindingId === params.bindingId) ?? -1;
      if (!c || index < 0) return notFound();
      const { requisiteId } = (await request.json()) as { requisiteId: string };
      const requisite = kaRequisites.find((r) => r.id === requisiteId);
      if (!requisite)
        return HttpResponse.json(
          { message: "Реквизит не найден" },
          { status: 404 },
        );
      const old = c.requisites[index];
      c.requisites[index] = { ...old, ...requisite };
      const at = new Date().toISOString();
      c.events.unshift(
        {
          id: `${c.id}-replace-${at}`,
          at,
          kind: "requisiteBound",
          trader: requisite.trader,
          requisite: { bank: requisite.bank, value: requisite.value },
        },
        {
          id: `${c.id}-unbind-${at}`,
          at,
          kind: "requisiteUnbound",
          trader: old.trader,
          requisite: { bank: old.bank, value: old.value },
        },
      );
      syncLatest(c);
      return new HttpResponse(null, { status: 204 });
    },
  ),

  http.delete(
    "/api/counterparties/:id/requisites/:bindingId",
    async ({ params }) => {
      await delay();
      const c = find(params.id);
      const old = c?.requisites.find((r) => r.bindingId === params.bindingId);
      if (!c || !old) return notFound();
      c.requisites = c.requisites.filter((r) => r !== old);
      c.events.unshift({
        id: `${c.id}-unbind-${Date.now()}`,
        at: new Date().toISOString(),
        kind: "requisiteUnbound",
        trader: old.trader,
        requisite: { bank: old.bank, value: old.value },
      });
      syncLatest(c);
      return new HttpResponse(null, { status: 204 });
    },
  ),
];
