import { subDays, subMinutes } from "date-fns";
import { delay } from "msw";
import { HttpResponse, http } from "msw/http";
import type {
  AccountActivity,
  AccountProfile,
  TelegramBot,
} from "@/features/account/types";
import { demoAccounts, SESSION_KEY } from "./data/auth";

const now = new Date();

const current = () =>
  demoAccounts.find((a) => a.login === localStorage.getItem(SESSION_KEY));

const unauthorized = () =>
  HttpResponse.json({ message: "Нужно войти" }, { status: 401 });

const uuids: Record<string, string> = {
  "admin-1": "8a5d9dba-2a62-473b-b0b5-c31d5eeae2ce",
  "admin-0": "1f3c7e20-9b4d-4a61-8f2e-6d0a5b9c4e17",
};

const bots: TelegramBot[] = [
  {
    id: "operation",
    name: "Admin operation bot",
    username: "paybull_operation_bot",
    kind: "admin",
    description:
      "Операторский бот для проверки чеков: без сделки, по UUID сделки, по чеку из сделки или по файлу, который админ загружает прямо в Telegram.",
    commands: ["/start", "/check", "/deal", "/file", "/receipt_inspect"],
    notifications: ["результат", "сигналы ручной проверки", "данные из чека"],
    binding: { command: "/receipt_inspect", telegramId: "23523542423" },
  },
  {
    id: "alerts",
    name: "Admin alerts bot",
    username: "paybull_alerts_bot",
    kind: "admin",
    description:
      "Сигналы платформы: апелляции, долги трейдеров, падения каскадов и низкие балансы. Только чтение, без команд для изменения данных.",
    commands: ["/start", "/mute", "/unmute"],
    notifications: ["апелляции", "каскады", "балансы"],
    binding: null,
  },
];

const activity: AccountActivity[] = [
  { id: "a1", at: subMinutes(now, 2).toISOString(), kind: "logout" },
  {
    id: "a2",
    at: subMinutes(now, 30).toISOString(),
    kind: "disputeOpened",
    dealId: "fdf32a7c90e1b44dfsdf32",
  },
  {
    id: "a3",
    at: subMinutes(now, 95).toISOString(),
    kind: "tradingBlocked",
    user: { id: "user-lead-1", login: "Super_maks" },
  },
  {
    id: "a4",
    at: subDays(now, 3).toISOString(),
    kind: "inviteCreated",
    code: "INVITE-SDFKH212311SA",
  },
  { id: "a5", at: subDays(now, 3).toISOString(), kind: "login" },
];

export const accountHandlers = [
  http.get("/api/me/profile", async () => {
    await delay();
    const account = current();
    if (!account) return unauthorized();
    return HttpResponse.json<AccountProfile>({
      id: uuids[account.user.id] ?? account.user.id,
      login: account.user.login,
      role: account.user.role,
      createdAt: subDays(now, 30).toISOString(),
    });
  }),

  http.post("/api/me/password", async ({ request }) => {
    await delay();
    const account = current();
    if (!account) return unauthorized();
    const { current: given, next } = (await request.json()) as {
      current: string;
      next: string;
    };
    if (given !== account.password)
      return HttpResponse.json(
        { message: "Текущий пароль указан неверно" },
        { status: 400 },
      );
    account.password = next;
    return new HttpResponse(null, { status: 204 });
  }),

  http.get("/api/me/bots", async () => {
    await delay();
    return HttpResponse.json(bots);
  }),

  http.post("/api/me/bots/:id/binding", async ({ params }) => {
    await delay();
    const bot = bots.find((b) => b.id === params.id);
    if (!bot)
      return HttpResponse.json({ message: "Бот не найден" }, { status: 404 });
    const token = Math.random().toString(36).slice(2, 12);
    bot.binding = { command: "/start", telegramId: "23523542423" };
    return HttpResponse.json({
      url: `https://t.me/${bot.username}?start=${token}`,
    });
  }),

  http.delete("/api/me/bots/:id/binding", async ({ params }) => {
    await delay();
    const bot = bots.find((b) => b.id === params.id);
    if (!bot)
      return HttpResponse.json({ message: "Бот не найден" }, { status: 404 });
    bot.binding = null;
    return new HttpResponse(null, { status: 204 });
  }),

  http.get("/api/me/activity", async () => {
    await delay();
    return HttpResponse.json(activity);
  }),
];
