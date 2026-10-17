import { format, parseISO } from "date-fns";
import { delay } from "msw";
import { HttpResponse, http } from "msw/http";
import {
  balanceReasonLabels,
  balanceTypeLabels,
} from "@/features/users/balance-reasons";
import type {
  DealSortField,
  RequisiteSortField,
} from "@/features/users/schemas";
import type { User, UserDeal, UserRequisite } from "@/features/users/types";
import {
  makeBalanceHistory,
  makeDeals,
  makeLogs,
  makeRequisites,
} from "./data/user-tabs";
import { users } from "./data/users";

const findUser = (id: unknown) => users.find((u) => u.id === id);

const notFound = () =>
  HttpResponse.json({ message: "Пользователь не найден" }, { status: 404 });

const dayOf = (iso: string) => format(parseISO(iso), "yyyy-MM-dd");

const inPeriod = (iso: string, params: URLSearchParams) => {
  const day = dayOf(iso);
  const from = params.get("from");
  const to = params.get("to");
  return (!from || day >= from) && (!to || day <= to);
};

const compare = (x: string | number, y: string | number) =>
  x < y ? -1 : x > y ? 1 : 0;

const savedEnabled = new Map<string, boolean>();

const merchants = () =>
  users.flatMap((u) =>
    u.role === "merchant" && u.merchant ? [u.merchant] : [],
  );

const dealSortValue: Record<
  DealSortField,
  (deal: UserDeal) => string | number
> = {
  createdAt: (deal) => deal.createdAt,
  amount: (deal) => Number(deal.amount),
  merchant: (deal) => deal.merchant.name.toLowerCase(),
};

const requisiteSortValue: Record<
  RequisiteSortField,
  (requisite: UserRequisite) => number
> = {
  total: (r) => Number(r.total),
  amount: (r) => (r.amount.max === null ? Infinity : Number(r.amount.max)),
  limits: (r) => Number(r.limits.daily.used) / Number(r.limits.daily.total),
};

const requisitesOf = (user: User) =>
  makeRequisites(user).map((r) => ({
    ...r,
    enabled: savedEnabled.get(r.id) ?? r.enabled,
  }));

const cell = (value: string) =>
  /[;"\n]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value;

export const userTabsHandlers = [
  http.get("/api/users/:id/balance-history", async ({ params, request }) => {
    await delay();
    const user = findUser(params.id);
    if (!user) return notFound();
    const search = new URL(request.url).searchParams;
    const reason = search.get("reason");
    return HttpResponse.json(
      makeBalanceHistory(user).filter(
        (op) =>
          inPeriod(op.createdAt, search) && (!reason || op.reason === reason),
      ),
    );
  }),

  http.get(
    "/api/users/:id/balance-history/export",
    async ({ params, request }) => {
      await delay();
      const user = findUser(params.id);
      if (!user) return notFound();
      const search = new URL(request.url).searchParams;
      const reason = search.get("reason");
      const rows = makeBalanceHistory(user)
        .filter(
          (op) =>
            inPeriod(op.createdAt, search) && (!reason || op.reason === reason),
        )
        .map((op) =>
          [
            format(parseISO(op.createdAt), "dd.MM.yyyy HH:mm:ss"),
            balanceReasonLabels[op.reason],
            op.id,
            op.amount,
            op.balanceBefore,
            op.balanceAfter,
            balanceTypeLabels[op.type],
          ]
            .map(cell)
            .join(";"),
        );
      const header =
        "Дата;Причина;ID;Изменение, USDT;Баланс до, USDT;Баланс после, USDT;Тип операции";
      return new HttpResponse(`﻿${[header, ...rows].join("\n")}`, {
        headers: { "Content-Type": "text/csv; charset=utf-8" },
      });
    },
  ),

  http.get("/api/users/:id/logs", async ({ params }) => {
    await delay();
    const user = findUser(params.id);
    return user ? HttpResponse.json(makeLogs(user)) : notFound();
  }),

  http.get("/api/users/:id/deals", async ({ params, request }) => {
    await delay();
    const user = findUser(params.id);
    if (!user) return notFound();
    const search = new URL(request.url).searchParams;
    const get = (key: string) => search.get(key);
    const amountFrom = get("amountFrom");
    const amountTo = get("amountTo");
    const sort = get("sort") as DealSortField | null;
    const direction = get("order") === "asc" ? 1 : -1;

    const deals = makeDeals(user, merchants()).filter(
      (deal) =>
        inPeriod(deal.createdAt, search) &&
        (!get("direction") || deal.direction === get("direction")) &&
        (!get("method") || deal.method === get("method")) &&
        (!get("bank") || deal.requisite.bank === get("bank")) &&
        (!get("merchant") || deal.merchant.id === get("merchant")) &&
        (!amountFrom || Number(deal.amount) >= Number(amountFrom)) &&
        (!amountTo || Number(deal.amount) <= Number(amountTo)),
    );
    const by = dealSortValue[sort ?? "createdAt"];
    deals.sort((a, b) => compare(by(a), by(b)) * direction);
    return HttpResponse.json(deals);
  }),

  http.get("/api/users/:id/requisites", async ({ params, request }) => {
    await delay();
    const user = findUser(params.id);
    if (!user) return notFound();
    const search = new URL(request.url).searchParams;
    const q = search.get("q")?.trim().toLowerCase();
    const digits = q?.replace(/\D/g, "");
    const status = search.get("status");
    const bank = search.get("bank");
    const sort = search.get("sort") as RequisiteSortField | null;
    const direction = search.get("order") === "asc" ? 1 : -1;

    const found = requisitesOf(user).filter(
      (r) =>
        (!q ||
          (digits && r.value.replace(/\D/g, "").includes(digits)) ||
          r.holder.toLowerCase().includes(q)) &&
        (!status || r.enabled === (status === "enabled")) &&
        (!bank || r.bank === bank),
    );
    if (sort) {
      const by = requisiteSortValue[sort];
      found.sort((a, b) => compare(by(a), by(b)) * direction);
    }
    return HttpResponse.json(found);
  }),

  http.patch(
    "/api/users/:id/requisites/:requisiteId",
    async ({ params, request }) => {
      await delay();
      const user = findUser(params.id);
      if (!user) return notFound();
      const requisite = requisitesOf(user).find(
        (r) => r.id === params.requisiteId,
      );
      if (!requisite) {
        return HttpResponse.json(
          { message: "Реквизит не найден" },
          { status: 404 },
        );
      }
      const { enabled } = (await request.json()) as { enabled: boolean };
      savedEnabled.set(requisite.id, enabled);
      return HttpResponse.json({ ...requisite, enabled });
    },
  ),
];
