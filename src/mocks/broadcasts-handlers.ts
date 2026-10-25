import { addMinutes, subDays, subHours } from "date-fns";
import { delay } from "msw";
import { HttpResponse, http } from "msw/http";
import type { Broadcast, BroadcastList } from "@/features/broadcasts/types";
import { demoAccounts, SESSION_KEY } from "./data/auth";
import { users } from "./data/users";

const now = new Date();

const reach = users.filter(
  (u) => (u.role === "trader" || u.role === "lead_trader") && u.telegram,
).length;
const REACH = Math.max(reach, 1) * 25;

const done = (
  id: string,
  at: Date,
  text: string,
  delivered: number,
  failed: number,
  author: string,
): Broadcast => ({
  id,
  createdAt: at.toISOString(),
  finishedAt: addMinutes(at, 5).toISOString(),
  text,
  status: failed === 0 ? "sent" : delivered === 0 ? "failed" : "partial",
  delivery: { total: delivered + failed, delivered, failed, pending: 0 },
  author,
});

const broadcasts: Broadcast[] = [
  done(
    "b3",
    subHours(now, 5),
    "Завтра с 03:00 до 04:00 МСК плановые работы: приём сделок будет остановлен. Пожалуйста, завершите активные сделки заранее.",
    250,
    50,
    "Admin_2004",
  ),
  done(
    "b2",
    subDays(now, 2),
    "Обновили мобильное приложение до 1.0.0: обновитесь, чтобы чеки распознавались быстрее.",
    300,
    0,
    "Alex_fun",
  ),
  done(
    "b1",
    subDays(now, 6),
    "Напоминаем: минимальный страховой депозит теперь 100 USDT.",
    0,
    280,
    "Max_root",
  ),
];

function progress(b: Broadcast): Broadcast {
  if (b.finishedAt) return b;
  const seconds = (Date.now() - Date.parse(b.createdAt)) / 1000;
  const total = b.delivery.total;
  if (seconds < 2) return { ...b, status: "queued" };
  const share = Math.min((seconds - 2) / 8, 1);
  const handled = Math.round(total * share);
  const failed = Math.round(handled * 0.04);
  const delivery = {
    total,
    delivered: handled - failed,
    failed,
    pending: total - handled,
  };
  if (share < 1) return { ...b, status: "sending", delivery };
  Object.assign(b, {
    status: failed === 0 ? "sent" : "partial",
    finishedAt: new Date().toISOString(),
    delivery,
  });
  return b;
}

export const broadcastsHandlers = [
  http.get("/api/broadcasts", async () => {
    await delay();
    const items = broadcasts.map(progress);
    const count = (s: Broadcast["status"][]) =>
      items.filter((b) => s.includes(b.status)).length;
    return HttpResponse.json<BroadcastList>({
      items,
      stats: {
        total: items.length,
        queued: count(["queued", "sending"]),
        sent: count(["sent", "partial"]),
        failed: count(["failed"]),
        reach: REACH,
        delivered: items.reduce((sum, b) => sum + b.delivery.delivered, 0),
      },
    });
  }),

  http.post("/api/broadcasts", async ({ request }) => {
    await delay();
    const { text } = (await request.json()) as { text: string };
    const author =
      demoAccounts.find((a) => a.login === localStorage.getItem(SESSION_KEY))
        ?.user.login ?? "admin";
    const broadcast: Broadcast = {
      id: `b${Date.now()}`,
      createdAt: new Date().toISOString(),
      finishedAt: null,
      text,
      status: "queued",
      delivery: { total: REACH, delivered: 0, failed: 0, pending: REACH },
      author,
    };
    broadcasts.unshift(broadcast);
    return HttpResponse.json(broadcast, { status: 201 });
  }),
];
