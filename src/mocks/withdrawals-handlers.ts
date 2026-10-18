import { differenceInMinutes, format, parseISO, subHours } from "date-fns";
import { delay } from "msw";
import { HttpResponse, http } from "msw/http";
import type { WithdrawalSortField } from "@/features/withdrawals/schemas";
import type {
  Withdrawal,
  WithdrawalList,
  WithdrawalStats,
} from "@/features/withdrawals/types";
import { withdrawalStatusMeta } from "@/features/withdrawals/withdrawal-status";
import { withdrawals } from "./data/withdrawals";

const sortValue: Record<
  WithdrawalSortField,
  (w: Withdrawal) => string | number
> = {
  number: (w) => w.number,
  user: (w) => w.user.login.toLowerCase(),
  transactions: (w) => w.transactions,
  amount: (w) => Number(w.amount),
  fee: (w) => Number(w.fee),
  createdAt: (w) => w.createdAt,
};

function find(params: URLSearchParams) {
  const q = params.get("q")?.trim().toLowerCase().replace(/^№/, "");
  const found = q
    ? withdrawals.filter((w) =>
        [String(w.number), w.id, w.user.login, w.address, w.txHash ?? ""].some(
          (value) => value.toLowerCase().includes(q),
        ),
      )
    : withdrawals;
  const status = params.get("status");
  const items = status ? found.filter((w) => w.status === status) : [...found];
  const sort = params.get("sort") as WithdrawalSortField | null;
  const direction = params.get("order") === "asc" ? 1 : -1;
  const by = sortValue[sort ?? "createdAt"];
  items.sort((a, b) => {
    const [x, y] = [by(a), by(b)];
    return (x < y ? -1 : x > y ? 1 : 0) * direction;
  });
  return { found, items };
}

const of = (status: string) => withdrawals.filter((w) => w.status === status);

export const withdrawalsHandlers = [
  http.get("/api/withdrawals", async ({ request }) => {
    await delay();
    const { found, items } = find(new URL(request.url).searchParams);
    const count = (status: string) =>
      found.filter((w) => w.status === status).length;
    return HttpResponse.json<WithdrawalList>({
      counts: {
        all: found.length,
        done: count("done"),
        processing: count("processing"),
        queued: count("queued"),
        error: count("error"),
      },
      items,
    });
  }),

  http.get("/api/withdrawals/stats", async () => {
    await delay();
    const dayAgo = subHours(new Date(), 24).toISOString();
    const lastDay = withdrawals.filter((w) => w.createdAt >= dayAgo);
    const paid = lastDay.filter((w) => w.status === "done");
    const processing = of("processing");
    return HttpResponse.json<WithdrawalStats>({
      queued: of("queued").length,
      active: of("queued").length + processing.length,
      processing: processing.length,
      stale: processing.filter(
        (w) => differenceInMinutes(new Date(), parseISO(w.createdAt)) > 30,
      ).length,
      manualReview: of("error").length,
      toReview: of("error").filter((w) => w.transactions > 1).length,
      paid24h: paid.reduce((sum, w) => sum + Number(w.amount), 0).toFixed(2),
      paid24hCount: paid.length,
      successRate: lastDay.length
        ? Math.round((paid.length / lastDay.length) * 100)
        : 0,
    });
  }),

  http.get("/api/withdrawals/export", async ({ request }) => {
    await delay();
    const { items } = find(new URL(request.url).searchParams);
    const rows = items.map((w) =>
      [
        w.number,
        withdrawalStatusMeta[w.status].label,
        w.user.login,
        w.address,
        w.transactions,
        w.txHash ?? "",
        w.amount,
        w.fee,
        format(parseISO(w.createdAt), "dd.MM.yyyy HH:mm:ss"),
      ].join(";"),
    );
    const header =
      "ID;Статус;Пользователь;Адрес;Транзакции;tx hash;Сумма, USDT;Комиссия, USDT;Дата";
    return new HttpResponse(`﻿${[header, ...rows].join("\n")}`, {
      headers: { "Content-Type": "text/csv; charset=utf-8" },
    });
  }),

  http.post("/api/withdrawals/:id/confirm", async ({ params, request }) => {
    await delay(800);
    const withdrawal = withdrawals.find((w) => w.id === params.id);
    if (!withdrawal) {
      return HttpResponse.json({ message: "Вывод не найден" }, { status: 404 });
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
    withdrawal.status = "done";
    withdrawal.txHash = txHash.toLowerCase();
    withdrawal.transactions += 1;
    return HttpResponse.json(withdrawal);
  }),
];
