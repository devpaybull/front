import { addMinutes, parseISO, subMinutes } from "date-fns";
import type {
  Deal,
  DealDetails,
  DealHistoryEntry,
} from "@/features/deals/types";
import { formatNumber } from "@/lib/format";
import { between, seeded } from "./user-profiles";
import { makeDeals } from "./user-tabs";
import { users } from "./users";

export type MockDeal = Deal & {
  kind: DealDetails["kind"];
  cascade: string;
  merchantGroup: string;
  counterparty: string;
};

const random = seeded("all-deals");
const pick = <T>(items: readonly T[]) =>
  items[between(random, 0, items.length - 1)];

const merchants = users.flatMap((u) =>
  u.role === "merchant" && u.merchant ? [u.merchant] : [],
);
export const cascades = users.flatMap((u) =>
  u.role === "cascade" && u.cascade ? [u.cascade.name] : [],
);
export const merchantGroups = ["Casino", "Betting", "Slots", "Poker"];

export const allDeals: MockDeal[] = users
  .flatMap((user) => makeDeals(user, merchants))
  .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
  .map((deal) => ({
    ...deal,
    kind: "deal" as const,
    createdAt: deal.deadline
      ? subMinutes(parseISO(deal.deadline), 15).toISOString()
      : deal.createdAt,
    cascade: pick(cascades),
    merchantGroup: pick(merchantGroups),
    counterparty: String(between(random, 1000000, 9999999)),
  }));

const buyoutStatuses = [
  "pending",
  "pending",
  "active",
  "completed",
  "completed",
  "cancelled",
] as const;

export const allBuyouts: MockDeal[] = allDeals.slice(0, 60).map((deal, i) => {
  const status = buyoutStatuses[i % buyoutStatuses.length];
  return {
    ...deal,
    id: `b${deal.id.slice(1)}`,
    kind: "buyout" as const,
    direction: "out" as const,
    status,
    deadline:
      status === "active" || status === "pending" ? deal.deadline : null,
    processor: status === "pending" ? null : deal.processor,
  };
});

const pages = new Map<string, DealDetails>();

export function dealDetails(id: string): DealDetails | undefined {
  const saved = pages.get(id);
  if (saved) return saved;
  const deal = [...allDeals, ...allBuyouts].find((d) => d.id === id);
  if (!deal) return undefined;
  const buyout = deal.kind === "buyout";
  const r = seeded(`${id}-page`);
  const rate = 88 + r() * 3;
  const receive = Number(deal.amount);
  const send = receive / rate;
  const done = deal.status === "completed";
  const history: DealHistoryEntry[] = [
    {
      id: `${id}-h0`,
      createdAt: deal.createdAt,
      kind: "created",
      text: `Мерчант создал сделку на сумму ${formatNumber(deal.amount, "auto")} RUB`,
    },
  ];
  if (done || deal.status === "cancelled") {
    history.unshift({
      id: `${id}-h1`,
      createdAt: addMinutes(
        parseISO(deal.createdAt),
        between(r, 2, 14),
      ).toISOString(),
      kind: done ? "completed" : "cancelled",
      text: done ? "Трейдер закрыл сделку" : "Время ожидания истекло",
    });
  }
  const details: DealDetails = {
    ...deal,
    merchantDealId: `${id.slice(0, 8)}${id.slice(-8)}`,
    cascadeDealId: r() > 0.6 ? `c${id.slice(4, 20)}` : null,
    kind: deal.kind,
    merchantUserId: String(between(r, 1000000, 9999999)),
    send: send.toFixed(1),
    receive: deal.amount,
    rate: rate.toFixed(2),
    payment: buyout
      ? {
          holder: r() > 0.5 ? null : deal.requisite.holder,
          bank: deal.requisite.bank,
          phone: null,
          card: `2345 5667 4562 ${String(between(r, 1000, 9999))}`,
        }
      : {
          holder: deal.requisite.holder,
          bank: deal.requisite.bank,
          phone: deal.requisite.phone,
          card: null,
        },
    fees: {
      merchant: { amount: (send * 0.2).toFixed(2), percent: "20" },
      trader: buyout
        ? null
        : { amount: (send * 0.125).toFixed(2), percent: "12.5" },
      cascade: buyout
        ? { amount: (send * 0.125).toFixed(2), percent: "12.5" }
        : null,
      leads:
        done && !buyout
          ? { amount: (send * 0.005).toFixed(2), count: 1 }
          : null,
    },
    files:
      buyout && done
        ? [
            { id: `${id}-f1`, name: "Квитанция о выплате.pdf", url: null },
            { id: `${id}-f2`, name: "Подтверждение сделки.pdf", url: null },
          ]
        : [],
    history,
  };
  pages.set(id, details);
  return details;
}
