import { subMinutes } from "date-fns";
import type {
  Withdrawal,
  WithdrawalStatus,
} from "@/features/withdrawals/types";
import { between, seeded } from "./user-profiles";
import { users } from "./users";

const random = seeded("withdrawals");
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

const statuses: WithdrawalStatus[] = [
  "done",
  "processing",
  "done",
  "queued",
  "done",
  "error",
  "done",
  "done",
];

const payees = users.filter(
  (u) => u.role === "trader" || u.role === "lead_trader",
);

let at = subMinutes(new Date(), 4);

export const withdrawals: Withdrawal[] = Array.from({ length: 44 }, (_, i) => {
  const status =
    i < statuses.length
      ? statuses[i]
      : pick([
          "done",
          "done",
          "done",
          "processing",
          "queued",
          "error",
        ] as const);
  const createdAt = at;
  at = subMinutes(at, between(random, 10, 240));
  const user = pick(payees);
  const sent = status !== "queued";
  return {
    id: `wd-${i + 1}`,
    number: 4214 - i,
    status,
    user: { id: user.id, login: user.login },
    address: tronAddress(),
    transactions: sent ? (status === "error" ? 2 : 1) : 0,
    txHash: sent ? hex(64) : null,
    amount: (between(random, 1, 180) * 500).toFixed(2),
    fee: "0.25",
    createdAt: createdAt.toISOString(),
  };
});
