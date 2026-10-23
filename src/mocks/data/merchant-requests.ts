import { subMinutes } from "date-fns";
import type {
  MerchantRequest,
  MerchantRequestDetails,
} from "@/features/merchant-requests/types";
import type { PaymentMethod } from "@/features/users/types";
import { between, seeded } from "./user-profiles";
import { users } from "./users";

const random = seeded("merchant-requests");
const pick = <T>(items: readonly T[]) =>
  items[between(random, 0, items.length - 1)];
const now = new Date();

const merchants = users.flatMap((u) =>
  u.role === "merchant" && u.merchant ? [u.merchant] : [],
);
const traders = users.filter(
  (u) => u.role === "trader" || u.role === "lead_trader",
);

const methods: { method: PaymentMethod; code: string; name: string }[] = [
  { method: "qr", code: "ftd_qr", name: "FTD QR" },
  { method: "sbp", code: "sbp", name: "СБП" },
  { method: "c2c", code: "c2c", name: "C2C" },
  { method: "ka", code: "ka_sbp", name: "К/А СБП" },
];
export const requestBanks = ["Т-банк", "Сбербанк", "Альфа-банк", "ВТБ"];

const errors = [
  "NO_REQUISITE_FOUND_FOR_THIS_AMOUNT",
  "NO_TRADER_ONLINE",
  "AMOUNT_OUT_OF_LIMITS",
  "COUNTERPARTY_BLACKLISTED",
];

const hex = (length: number) =>
  Array.from({ length }, () => pick([..."0123456789abcdef"])).join("");

export type MockRequest = MerchantRequest & {
  code: string;
  details: Omit<MerchantRequestDetails, keyof MerchantRequest>;
};

export const merchantRequests: MockRequest[] = Array.from(
  { length: 140 },
  (_, n) => {
    const kind = pick(methods);
    const created = random() > 0.25;
    const processor = created
      ? pick(traders)
      : random() > 0.6
        ? pick(traders)
        : null;
    const amount = between(random, 1, 400) * 500;
    const bank = random() > 0.6 ? pick(requestBanks) : null;
    const merchantUserId = String(between(random, 1000, 9999));
    const transactionId = hex(26).toUpperCase();
    const createdAt = subMinutes(now, n * between(random, 3, 40) + 1);
    const responseMs = between(random, 20, 900);
    const direction = random() > 0.15 ? "payIn" : "payOut";
    return {
      id: hex(24),
      createdAt: createdAt.toISOString(),
      merchant: pick(merchants),
      method: kind.method,
      methodName: kind.name,
      code: kind.code,
      direction,
      amount: amount.toFixed(2),
      bank,
      merchantUserId,
      result: created ? "created" : "rejected",
      processor: processor
        ? { id: processor.id, login: processor.login }
        : null,
      responseMs,
      details: {
        processing: created
          ? "Обработчик принял"
          : processor
            ? "Обработчик не принял"
            : "Нет обработчика",
        errorCode: created ? null : pick(errors),
        dealId: created ? hex(20) : null,
        processingMs: Math.max(5, responseMs - between(random, 5, 15)),
        headers: {
          "Content-Type": "application/json",
          "X-Merchant-Id": merchantUserId,
          "X-Request-Id": transactionId,
          "X-Signature": `sha256=${hex(32)}`,
          "User-Agent": "merchant-sdk/2.4.1",
        },
        body: {
          method: kind.code,
          amount,
          currency: "RUB",
          merchantTransactionId: transactionId,
          callbackUrl: "ht***mf",
          successUrl: "ht***o/",
          errorUrl: "ht***o/",
          ...(bank ? { bank } : {}),
          payerInfo: {
            userAgent:
              "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Mobile Safari/537.36",
            ip: `178.130.${between(random, 1, 254)}.${between(random, 1, 254)}`,
            userId: merchantUserId,
            fingerprint: hex(21),
            registeredAt: String(1680779877000 + between(random, 0, 9e9)),
          },
        },
        response: created
          ? { status: "ok", dealId: "", amount, expiresIn: 900 }
          : { status: "error", code: "", message: "Сделка не создана" },
      },
    } satisfies MockRequest;
  },
).map((r) => {
  const response = r.details.response as Record<string, unknown>;
  if (r.details.dealId) response.dealId = r.details.dealId;
  else response.code = r.details.errorCode;
  return r;
});
