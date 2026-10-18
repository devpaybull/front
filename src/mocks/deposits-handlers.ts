import { format, parseISO, subHours } from "date-fns";
import { delay } from "msw";
import { HttpResponse, http } from "msw/http";
import { depositStatusMeta } from "@/features/deposits/deposit-status";
import type { DepositSortField } from "@/features/deposits/schemas";
import type {
  Deposit,
  DepositList,
  DepositStats,
} from "@/features/deposits/types";
import { deposits } from "./data/deposits";
import { users } from "./data/users";

const sortValue: Record<DepositSortField, (d: Deposit) => string | number> = {
  number: (d) => d.number,
  user: (d) => d.user.login.toLowerCase(),
  amount: (d) => Number(d.amount),
  createdAt: (d) => d.createdAt,
};

function find(params: URLSearchParams) {
  const q = params.get("q")?.trim().toLowerCase().replace(/^№/, "");
  const found = q
    ? deposits.filter((d) =>
        [String(d.number), d.id, d.user.login, d.address, d.txHash ?? ""].some(
          (value) => value.toLowerCase().includes(q),
        ),
      )
    : deposits;
  const status = params.get("status");
  const items = status ? found.filter((d) => d.status === status) : [...found];
  const sort = params.get("sort") as DepositSortField | null;
  const direction = params.get("order") === "asc" ? 1 : -1;
  const by = sortValue[sort ?? "createdAt"];
  items.sort((a, b) => {
    const [x, y] = [by(a), by(b)];
    return (x < y ? -1 : x > y ? 1 : 0) * direction;
  });
  return { found, items };
}

export const depositsHandlers = [
  http.get("/api/deposits", async ({ request }) => {
    await delay();
    const { found, items } = find(new URL(request.url).searchParams);
    const count = (status: string) =>
      found.filter((d) => d.status === status).length;
    return HttpResponse.json<DepositList>({
      counts: {
        all: found.length,
        processing: count("processing"),
        problem: count("problem"),
        credited: count("credited"),
        refunded: count("refunded"),
      },
      items,
    });
  }),

  http.get("/api/deposits/stats", async () => {
    await delay();
    const dayAgo = subHours(new Date(), 24).toISOString();
    const lastDay = deposits.filter((d) => d.createdAt >= dayAgo);
    const credited = lastDay.filter((d) => d.status === "credited");
    const of = (status: string) =>
      deposits.filter((d) => d.status === status).length;
    return HttpResponse.json<DepositStats>({
      total: deposits.length,
      inProgress: of("processing"),
      processing: of("processing") + of("refunded"),
      problem: of("problem"),
      amlFailed: deposits.filter(
        (d) => d.status === "problem" && d.aml?.flags.length,
      ).length,
      credited24h: credited
        .reduce((sum, d) => sum + Number(d.amount), 0)
        .toFixed(2),
      credited24hCount: credited.length,
      successRate: lastDay.length
        ? Math.round((credited.length / lastDay.length) * 100)
        : 0,
    });
  }),

  http.get("/api/deposits/export", async ({ request }) => {
    await delay();
    const { items } = find(new URL(request.url).searchParams);
    const rows = items.map((d) =>
      [
        d.number,
        depositStatusMeta[d.status].label,
        d.user.login,
        d.amount,
        d.fee,
        d.address,
        d.txHash ?? "",
        d.aml ? `${d.aml.source} ${d.aml.risk}%` : "",
        format(parseISO(d.createdAt), "dd.MM.yyyy HH:mm:ss"),
      ].join(";"),
    );
    const header =
      "№;Статус;Пользователь;Сумма, USDT;Комиссия, USDT;Адрес;tx hash;AML;Создано";
    return new HttpResponse(`﻿${[header, ...rows].join("\n")}`, {
      headers: { "Content-Type": "text/csv; charset=utf-8" },
    });
  }),

  http.post("/api/deposits/:id/confirm", async ({ params, request }) => {
    await delay(800);
    const deposit = deposits.find((d) => d.id === params.id);
    if (!deposit) {
      return HttpResponse.json(
        { message: "Пополнение не найдено" },
        { status: 404 },
      );
    }
    const { txHash } = (await request.json()) as { txHash: string };
    if (!/^[0-9a-f]{64}$/i.test(txHash)) {
      return HttpResponse.json(
        { message: "Неверный формат хеша" },
        { status: 400 },
      );
    }
    if (txHash.startsWith("0000")) {
      return HttpResponse.json(
        { message: "Транзакция не найдена в сети TRON" },
        { status: 422 },
      );
    }
    deposit.status = "credited";
    deposit.txHash = txHash.toLowerCase();
    deposit.transactions = Math.max(1, deposit.transactions);
    const user = users.find((u) => u.id === deposit.user.id);
    if (user) {
      user.balance = (Number(user.balance) + Number(deposit.amount)).toFixed(2);
    }
    return HttpResponse.json(deposit);
  }),
];
