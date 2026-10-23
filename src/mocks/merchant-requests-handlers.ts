import { endOfDay, format, parseISO, startOfDay } from "date-fns";
import { delay } from "msw";
import { HttpResponse, http } from "msw/http";
import type { RequestSortField } from "@/features/merchant-requests/schemas";
import type {
  MerchantRequest,
  MerchantRequestDetails,
  MerchantRequestFilterOptions,
  MerchantRequestList,
} from "@/features/merchant-requests/types";
import { paymentMethodLabels } from "@/features/users/payment-methods";
import {
  type MockRequest,
  merchantRequests,
  requestBanks,
} from "./data/merchant-requests";

const sortValue: Record<
  RequestSortField,
  (r: MerchantRequest) => string | number
> = {
  createdAt: (r) => r.createdAt,
  merchant: (r) => r.merchant.name.toLowerCase(),
  amount: (r) => Number(r.amount),
  merchantUserId: (r) => Number(r.merchantUserId),
};

const row = ({ code: _code, details: _details, ...r }: MockRequest) => r;

function filter(params: URLSearchParams) {
  const q = params.get("q")?.trim().toLowerCase();
  const from = params.get("from");
  const to = params.get("to");
  const amountFrom = params.get("amountFrom");
  const amountTo = params.get("amountTo");
  const bank = params.get("bank");
  const method = params.get("method");
  const direction = params.get("direction");
  return merchantRequests.filter(
    (r) =>
      (!q ||
        [r.id, r.merchant.name, r.merchantUserId].some((v) =>
          v.toLowerCase().includes(q),
        )) &&
      (!from || parseISO(r.createdAt) >= startOfDay(parseISO(from))) &&
      (!to || parseISO(r.createdAt) <= endOfDay(parseISO(to))) &&
      (!amountFrom || Number(r.amount) >= Number(amountFrom)) &&
      (!amountTo || Number(r.amount) <= Number(amountTo)) &&
      (!bank || r.bank === bank) &&
      (!method || r.method === method) &&
      (!direction || r.direction === direction),
  );
}

function list(params: URLSearchParams) {
  const found = filter(params);
  const result = params.get("result");
  const items = result ? found.filter((r) => r.result === result) : [...found];
  const sort = params.get("sort") as RequestSortField | null;
  const direction = params.get("order") === "asc" ? 1 : -1;
  const by = sortValue[sort ?? "createdAt"];
  items.sort((a, b) => {
    const [x, y] = [by(a), by(b)];
    return (x < y ? -1 : x > y ? 1 : 0) * direction;
  });
  return { found, items };
}

export const merchantRequestsHandlers = [
  http.get("/api/merchant-requests", async ({ request }) => {
    await delay();
    const { found, items } = list(new URL(request.url).searchParams);
    return HttpResponse.json<MerchantRequestList>({
      items: items.map(row),
      counts: {
        all: found.length,
        created: found.filter((r) => r.result === "created").length,
        rejected: found.filter((r) => r.result === "rejected").length,
      },
    });
  }),

  http.get("/api/merchant-requests/filter-options", async () => {
    await delay();
    const methods = [...new Set(merchantRequests.map((r) => r.method))];
    return HttpResponse.json<MerchantRequestFilterOptions>({
      banks: requestBanks,
      methods: methods.map((value) => ({
        value,
        label: paymentMethodLabels[value],
      })),
    });
  }),

  http.get("/api/merchant-requests/export", async ({ request }) => {
    await delay();
    const { items } = list(new URL(request.url).searchParams);
    const rows = items.map((r) =>
      [
        format(parseISO(r.createdAt), "dd.MM.yyyy HH:mm:ss"),
        r.merchant.name,
        r.methodName,
        r.direction === "payIn" ? "Покупка pay-in" : "Продажа pay-out",
        r.amount,
        r.bank ?? "Любой банк",
        r.merchantUserId,
        r.result === "created" ? "Создана" : "Не создана",
        r.processor?.login ?? "",
        r.responseMs,
      ].join(";"),
    );
    const header =
      "Время;Мерчант;Метод;Направление;Сумма, RUB;Банк;User ID;Результат;Обработано;Ответ за, мс";
    return new HttpResponse(`﻿${[header, ...rows].join("\n")}`, {
      headers: { "Content-Type": "text/csv; charset=utf-8" },
    });
  }),

  http.get("/api/merchant-requests/:id", async ({ params }) => {
    await delay();
    const found = merchantRequests.find((r) => r.id === params.id);
    if (!found)
      return HttpResponse.json(
        { message: "Запрос не найден" },
        { status: 404 },
      );
    return HttpResponse.json<MerchantRequestDetails>({
      ...row(found),
      ...found.details,
    });
  }),
];
