import { delay } from "msw";
import { HttpResponse, http } from "msw/http";
import type { DebtSortField } from "@/features/debtors/schemas";
import type { Debt } from "@/features/debtors/types";
import { demoUser } from "./data/auth";
import { debtLogs, debts } from "./data/debts";
import { users } from "./data/users";

const sortValue: Record<DebtSortField, (d: Debt) => string | number> = {
  user: (d) => d.user.login.toLowerCase(),
  amount: (d) => Number(d.amount),
};

const notFound = () =>
  HttpResponse.json({ message: "Долг не найден" }, { status: 404 });

const money = (value: number) => value.toFixed(2);

export const debtsHandlers = [
  http.get("/api/debts", async ({ request }) => {
    await delay();
    const params = new URL(request.url).searchParams;
    const q = params.get("q")?.trim().toLowerCase();
    const found = q
      ? debts.filter((d) =>
          [d.id, d.user.login, d.user.telegram ?? "", d.issuedBy.login].some(
            (value) => value.toLowerCase().includes(q),
          ),
        )
      : [...debts];
    const sort = params.get("sort") as DebtSortField | null;
    const direction = params.get("order") === "asc" ? 1 : -1;
    found.sort((a, b) => {
      const [x, y] = sort
        ? [sortValue[sort](a), sortValue[sort](b)]
        : [b.createdAt, a.createdAt];
      return (x < y ? -1 : x > y ? 1 : 0) * (sort ? direction : 1);
    });
    return HttpResponse.json(found);
  }),

  http.get("/api/debts/:id/log", async ({ params }) => {
    await delay();
    const log = debtLogs.get(String(params.id));
    return log ? HttpResponse.json(log) : notFound();
  }),

  http.patch("/api/debts/:id", async ({ params, request }) => {
    await delay();
    const debt = debts.find((d) => d.id === params.id);
    if (!debt) return notFound();
    Object.assign(debt, await request.json());
    return HttpResponse.json(debt);
  }),

  http.post("/api/debts/:id/write-off", async ({ params, request }) => {
    await delay(600);
    const index = debts.findIndex((d) => d.id === params.id);
    if (index === -1) return notFound();
    const debt = debts[index];
    const { amount } = (await request.json()) as { amount: string };
    const value = Number(amount);
    if (!(value > 0) || value > Number(debt.amount)) {
      return HttpResponse.json(
        { message: "Сумма больше долга" },
        { status: 400 },
      );
    }
    const user = users.find((u) => u.id === debt.user.id);
    if (user) user.balance = money(Number(user.balance) - value);
    const left = Number(debt.amount) - value;
    debtLogs.get(debt.id)?.unshift({
      id: `${debt.id}-${Date.now()}`,
      createdAt: new Date().toISOString(),
      kind: "writeOff",
      amount: money(value),
      debtAfter: money(left),
      by: { id: demoUser.id, login: demoUser.login },
    });
    if (left <= 0) {
      debts.splice(index, 1);
      return new HttpResponse(null, { status: 204 });
    }
    debt.amount = money(left);
    return HttpResponse.json(debt);
  }),
];
