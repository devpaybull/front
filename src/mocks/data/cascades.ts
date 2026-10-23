import { subMinutes } from "date-fns";
import type { Cascade, CascadeRequest } from "@/features/cascades/types";
import type { PaymentMethod } from "@/features/users/types";
import { between, seeded } from "./user-profiles";
import { users } from "./users";

const random = seeded("cascades");
const pick = <T>(items: readonly T[]) =>
  items[between(random, 0, items.length - 1)];
const now = new Date();
const usdtRate = 92.5;

export const cascades: Cascade[] = users
  .filter((u) => u.role === "cascade" && u.cascade)
  .map((user, n) => {
    const rub = between(random, 0, 900) * 1000 + random();
    const total = between(random, 1000, 500_000) + random();
    return {
      id: user.cascade?.id ?? user.id,
      name: user.cascade?.name ?? user.login,
      userId: user.id,
      enabled: random() > 0.2,
      priority: n + 1,
      volumeToday: { rub: rub.toFixed(2), usdt: (rub / usdtRate).toFixed(2) },
      dealsPerMinute: between(random, 0, 12),
      amountRange: {
        min: String(between(random, 1, 10) * 100),
        max: String(between(random, 5, 50) * 100_000),
      },
      merchants:
        random() > 0.4
          ? { count: 12, all: true }
          : { count: between(random, 1, 11), all: false },
      balance: {
        total: total.toFixed(2),
        withoutActive: (total * (0.6 + random() * 0.4)).toFixed(2),
        limit: (between(random, 1, 50) * 1000).toFixed(2),
      },
    };
  });

const methods: PaymentMethod[] = ["sbp", "sbp", "c2c", "qr"];
export const cascadeBanks = ["Т-банк", "Сбербанк", "Альфа-банк", "ВТБ"];
const errorStatuses = [400, 409, 422, 500, 502, 503, 504];

const hex = (length: number) =>
  Array.from({ length }, () => pick([..."0123456789abcdef"])).join("");

export const cascadeRequests: CascadeRequest[] = Array.from(
  { length: 120 },
  (_, n) => {
    const cascade = pick(cascades);
    const ok = random() > 0.2;
    const method = pick(methods);
    const amount = between(random, 1, 400) * 1000;
    const bank = random() > 0.6 ? pick(cascadeBanks) : null;
    const httpStatus = ok ? 200 : pick(errorStatuses);
    const id = hex(24);
    return {
      id,
      createdAt: subMinutes(now, n * between(random, 2, 30) + 1).toISOString(),
      cascade: { id: cascade.id, name: cascade.name },
      method,
      direction: random() > 0.15 ? "payIn" : "payOut",
      amount: amount.toFixed(2),
      bank,
      result: ok ? "success" : "error",
      httpStatus,
      responseMs: between(random, 40, 2500),
      body: {
        orderId: id,
        method,
        amount,
        currency: "RUB",
        ...(bank ? { bank } : {}),
        callbackUrl: "https://api.paybull.example/cascade/callback",
      },
      response: ok
        ? {
            status: "accepted",
            externalId: hex(16),
            requisite: { type: method, holder: "Иванов И." },
          }
        : {
            status: "error",
            code: httpStatus,
            message:
              httpStatus >= 500 ? "Service Unavailable" : "Request rejected",
          },
    };
  },
);
