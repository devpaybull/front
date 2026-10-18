import { subMinutes } from "date-fns";
import type {
  AmlFlag,
  Deposit,
  DepositStatus,
} from "@/features/deposits/types";
import { between, seeded } from "./user-profiles";
import { users } from "./users";

const random = seeded("deposits");
const pick = <T>(items: readonly T[]) =>
  items[between(random, 0, items.length - 1)];
const hex = (length: number) =>
  Array.from({ length }, () => "0123456789abcdef"[between(random, 0, 15)]).join(
    "",
  );
const tronAddress = () =>
  `T${Array.from(
    { length: 33 },
    () =>
      "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"[
        between(random, 0, 56)
      ],
  ).join("")}`;

const statuses: DepositStatus[] = [
  "credited",
  "processing",
  "credited",
  "problem",
  "refunded",
  "credited",
  "credited",
  "problem",
  "credited",
  "processing",
];
const allFlags: AmlFlag[] = [
  "exchange",
  "lawEnforcement",
  "gambling",
  "sanctions",
  "scam",
];
const sources = ["Pay.Space", "Binance", "Bybit", "OKX", "Неизвестный кошелёк"];

const payers = users.filter(
  (u) => u.role === "trader" || u.role === "lead_trader",
);

let at = subMinutes(new Date(), 3);

export const deposits: Deposit[] = Array.from({ length: 48 }, (_, i) => {
  const status = statuses[i % statuses.length];
  const createdAt = at;
  at = subMinutes(at, between(random, 5, 180));
  const user = pick(payers);
  const risky = status === "problem" || random() > 0.8;
  const paid = status !== "processing" || random() > 0.5;
  return {
    id: `dep-${i + 1}`,
    number: 4214 - i,
    windowMinutes: 45,
    status,
    user: { id: user.id, login: user.login },
    amount: (between(random, 1, 180) * 500).toFixed(2),
    fee: "0.50",
    address: tronAddress(),
    transactions: paid ? 1 : 0,
    txHash: paid ? hex(64) : null,
    aml: paid
      ? {
          source: pick(sources),
          risk: risky ? between(random, 10, 85) : between(random, 0, 9),
          checkedAt: subMinutes(
            createdAt,
            -between(random, 1, 5),
          ).toISOString(),
          flags: risky ? allFlags.filter(() => random() > 0.3) : [],
        }
      : null,
    createdAt: createdAt.toISOString(),
  };
});
