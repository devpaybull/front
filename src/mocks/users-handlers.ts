import { delay } from "msw";
import { HttpResponse, http } from "msw/http";
import type { UserSortField } from "@/features/users/schemas";
import type {
  CurrencyRates,
  User,
  UserList,
  UserNote,
  UserSettings,
} from "@/features/users/types";
import { userRoles } from "@/features/users/user-role";
import { demoUser } from "./data/auth";
import { lendInMocks } from "./data/debts";
import {
  makeFingerprints,
  makeNote,
  makeProfile,
  makeRates,
  makeReferrals,
  makeSettings,
  makeStats,
} from "./data/user-profiles";
import { users } from "./data/users";

const savedSettings = new Map<string, UserSettings>();
const savedNotes = new Map<string, UserNote | null>();
const savedTelegram = new Map<
  string,
  { telegramId?: string; telegramGroups?: string[] }
>();

const profileOf = (user: User) => ({
  ...makeProfile(
    user,
    savedSettings.get(user.id) ?? makeSettings(user),
    savedNotes.has(user.id)
      ? (savedNotes.get(user.id) ?? null)
      : makeNote(user),
  ),
  ...savedTelegram.get(user.id),
});

const findUser = (id: unknown) => users.find((u) => u.id === id);

const savedRates = new Map<string, CurrencyRates[]>();

function summarizeRates(user: User, rates: CurrencyRates[]) {
  const all = rates.flatMap((c) =>
    c.methods.flatMap((m) => [m, ...m.byAmount, ...m.byBank]),
  );
  const range = (values: number[]) => ({
    min: String(Math.min(...values)),
    max: String(Math.max(...values)),
  });
  if (all.length === 0) return;
  user.rate = {
    payIn: range(all.map((r) => Number(r.payIn))),
    payOut: range(all.map((r) => Number(r.payOut))),
  };
}

const badRequest = (message: string) =>
  HttpResponse.json({ message }, { status: 400 });

const notFound = () =>
  HttpResponse.json({ message: "Пользователь не найден" }, { status: 404 });

const sortValue: Record<UserSortField, (user: User) => string | number> = {
  login: (user) => user.login.toLowerCase(),
  balance: (user) => Number(user.balance),
  deposit: (user) => Number(user.minInsuranceDeposit.payIn),
  rate: (user) => Number(user.rate.payIn.max),
  registeredAt: (user) => user.registeredAt,
  cascade: (user) => user.cascade?.name.toLowerCase() ?? "",
  merchant: (user) => user.merchant?.name.toLowerCase() ?? "",
};

export const usersHandlers = [
  http.get("/api/users", async ({ request }) => {
    await delay();
    const params = new URL(request.url).searchParams;
    const q = params.get("q")?.trim().toLowerCase();
    const role = params.get("role");
    const sort = params.get("sort") as UserSortField | null;
    const direction = params.get("order") === "asc" ? 1 : -1;

    const found = q
      ? users.filter((u) =>
          [
            u.login,
            u.telegram ?? "",
            u.token,
            u.cascade?.name ?? "",
            u.merchant?.name ?? "",
          ].some((value) => value.toLowerCase().includes(q)),
        )
      : users;

    const counts = Object.fromEntries([
      ["all", found.length],
      ...userRoles.map((r) => [r, found.filter((u) => u.role === r).length]),
    ]) as UserList["counts"];

    const items = role ? found.filter((u) => u.role === role) : [...found];
    items.sort((a, b) => {
      const [x, y] = sort
        ? [sortValue[sort](a), sortValue[sort](b)]
        : [b.registeredAt, a.registeredAt];
      return (x < y ? -1 : x > y ? 1 : 0) * (sort ? direction : 1);
    });

    return HttpResponse.json<UserList>({ counts, items });
  }),

  http.get("/api/users/:id", async ({ params }) => {
    await delay();
    const user = users.find((u) => u.id === params.id);
    return user ? HttpResponse.json(profileOf(user)) : notFound();
  }),

  http.get("/api/users/:id/rates", async ({ params }) => {
    await delay();
    const user = findUser(params.id);
    if (!user) return notFound();
    return HttpResponse.json(savedRates.get(user.id) ?? makeRates(user));
  }),

  http.get("/api/users/:id/stats", async ({ params }) => {
    await delay();
    const user = users.find((u) => u.id === params.id);
    return user ? HttpResponse.json(makeStats(user)) : notFound();
  }),

  http.patch("/api/users/:id/settings", async ({ params, request }) => {
    await delay();
    const user = users.find((u) => u.id === params.id);
    if (!user) return notFound();
    const { reason: _reason, ...patch } = (await request.json()) as Partial<
      UserSettings & { reason: string }
    >;
    savedSettings.set(user.id, { ...profileOf(user).settings, ...patch });
    return HttpResponse.json(profileOf(user));
  }),

  http.put("/api/users/:id/note", async ({ params, request }) => {
    await delay();
    const user = findUser(params.id);
    if (!user) return notFound();
    const { text } = (await request.json()) as { text: string };
    savedNotes.set(user.id, {
      text,
      author: demoUser.login,
      updatedAt: new Date().toISOString(),
    });
    return HttpResponse.json(profileOf(user));
  }),

  http.delete("/api/users/:id/note", async ({ params }) => {
    await delay();
    const user = findUser(params.id);
    if (!user) return notFound();
    savedNotes.set(user.id, null);
    return HttpResponse.json(profileOf(user));
  }),

  http.post("/api/users/:id/transfers", async ({ params, request }) => {
    await delay();
    const sender = findUser(params.id);
    if (!sender) return notFound();
    const { recipientId, amount } = (await request.json()) as {
      recipientId: string;
      amount: string;
    };
    const recipient = findUser(recipientId);
    if (!recipient || recipient.id === sender.id) {
      return badRequest("Получатель не найден");
    }
    if (Number(amount) > Number(sender.balance)) {
      return badRequest("Недостаточно средств на балансе");
    }
    sender.balance = (Number(sender.balance) - Number(amount)).toFixed(2);
    recipient.balance = (Number(recipient.balance) + Number(amount)).toFixed(2);
    return HttpResponse.json(profileOf(sender));
  }),

  http.post("/api/users/:id/leads", async ({ params, request }) => {
    await delay();
    const trader = findUser(params.id);
    if (!trader) return notFound();
    const body = (await request.json()) as { leadId: string }[];
    for (const { leadId } of body) {
      const lead = findUser(leadId);
      if (lead?.role !== "lead_trader") {
        return badRequest("Тим-лид не найден");
      }
      if (!trader.dependencies.some((d) => d.id === lead.id)) {
        trader.dependencies.push({ id: lead.id, login: lead.login });
      }
      if (!lead.dependencies.some((d) => d.id === trader.id)) {
        lead.dependencies.push({ id: trader.id, login: trader.login });
      }
    }
    return HttpResponse.json(profileOf(trader));
  }),

  http.post("/api/users/:id/sessions/end", async ({ params }) => {
    await delay();
    if (!findUser(params.id)) return notFound();
    return new HttpResponse(null, { status: 204 });
  }),

  http.post("/api/users/:id/password-reset", async ({ params }) => {
    await delay();
    if (!findUser(params.id)) return notFound();
    const letters = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
    const password = Array.from(
      { length: 11 },
      () => letters[Math.floor(Math.random() * letters.length)],
    ).join("");
    return HttpResponse.json({ password });
  }),

  http.post("/api/users/:id/2fa-reset", async ({ params }) => {
    await delay();
    if (!findUser(params.id)) return notFound();
    return new HttpResponse(null, { status: 204 });
  }),

  http.post("/api/users/:id/debts", async ({ params, request }) => {
    await delay();
    const user = findUser(params.id);
    if (!user) return notFound();
    const { amount } = (await request.json()) as { amount: string };
    user.balance = (Number(user.balance) + Number(amount)).toFixed(2);
    lendInMocks(user, amount);
    return HttpResponse.json(profileOf(user));
  }),

  http.put("/api/users/:id/min-insurance", async ({ params, request }) => {
    await delay();
    const user = findUser(params.id);
    if (!user) return notFound();
    user.minInsuranceDeposit =
      (await request.json()) as User["minInsuranceDeposit"];
    return HttpResponse.json(profileOf(user));
  }),

  http.patch("/api/users/:id/telegram", async ({ params, request }) => {
    await delay();
    const user = findUser(params.id);
    if (!user) return notFound();
    const { telegram, ...rest } = (await request.json()) as {
      telegram?: string;
      telegramId?: string;
      telegramGroups?: string[];
    };
    if (telegram !== undefined) user.telegram = telegram;
    savedTelegram.set(user.id, { ...savedTelegram.get(user.id), ...rest });
    return HttpResponse.json(profileOf(user));
  }),

  http.put("/api/users/:id/rates", async ({ params, request }) => {
    await delay();
    const user = findUser(params.id);
    if (!user) return notFound();
    const rates = (await request.json()) as CurrencyRates[];
    savedRates.set(user.id, rates);
    summarizeRates(user, rates);
    return HttpResponse.json(rates);
  }),

  http.get("/api/users/:id/fingerprints", async ({ params }) => {
    await delay();
    const user = findUser(params.id);
    return user ? HttpResponse.json(makeFingerprints(user)) : notFound();
  }),

  http.get("/api/users/:id/referrals", async ({ params }) => {
    await delay();
    const user = findUser(params.id);
    return user ? HttpResponse.json(makeReferrals(user)) : notFound();
  }),
];
