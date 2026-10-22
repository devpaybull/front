import { subDays, subHours, subMinutes } from "date-fns";
import type {
  BindType,
  BoundRequisite,
  Counterparty,
  CounterpartyEvent,
  CounterpartyEventKind,
  CounterpartyRequisite,
} from "@/features/counterparties/types";
import type { PaymentMethod } from "@/features/users/types";
import { between, seeded } from "./user-profiles";
import { makeRequisites } from "./user-tabs";
import { users } from "./users";

const random = seeded("counterparties");
const pick = <T>(items: readonly T[]) =>
  items[between(random, 0, items.length - 1)];
const now = new Date();

export const kaRequisites: CounterpartyRequisite[] = users
  .flatMap(makeRequisites)
  .filter((r) => r.scope === "counterpartiesOnly" && r.kind !== "account")
  .map(({ id, kind, value, holder, bank, trader }) => ({
    id,
    kind,
    value,
    holder,
    bank,
    trader,
  }));

const merchants = users.flatMap((u) =>
  u.role === "merchant" && u.merchant ? [u.merchant] : [],
);

const bindTypes: BindType[] = ["cardsOrSbp", "cardsOrSbp", "sbp", "cards"];

export function bind(
  requisite: CounterpartyRequisite,
  bindType: BindType,
  boundAt: Date,
): BoundRequisite {
  return {
    ...requisite,
    bindingId: `bind-${requisite.id}-${boundAt.getTime()}`,
    bindType,
    channel: requisite.kind === "card" ? "card" : "sbp",
    boundAt: boundAt.toISOString(),
  };
}

export type MockCounterparty = Counterparty & {
  createdAt: string;
  lastDepositAt: string | null;
  requisites: BoundRequisite[];
  events: CounterpartyEvent[];
};

const rub = (n: number) => n.toFixed(2);
const methods: PaymentMethod[] = ["sbp", "sbp", "c2c", "qr"];

function makeEvents(
  id: string,
  requisites: BoundRequisite[],
): CounterpartyEvent[] {
  const deals: CounterpartyEventKind[] = [
    "dealRequest",
    "dealByRequisite",
    "dealPaid",
  ];
  const events: CounterpartyEvent[] = [];
  const count = between(random, 6, 18);
  for (let n = 0; n < count; n++) {
    const kind = pick(deals);
    const requisite = requisites.length > 0 ? pick(requisites) : null;
    events.push({
      id: `${id}-event-${n}`,
      at: subMinutes(now, n * between(random, 40, 600) + 5).toISOString(),
      kind,
      method: pick(methods),
      amount: rub(between(random, 5, 300) * 1000),
      ...(kind !== "dealRequest" && requisite
        ? {
            trader: requisite.trader,
            requisite: { bank: requisite.bank, value: requisite.value },
            dealId: Array.from({ length: 20 }, () =>
              pick([..."0123456789abcdef"]),
            ).join(""),
          }
        : {}),
    });
  }
  for (const r of requisites) {
    events.push({
      id: `${id}-${r.bindingId}`,
      at: r.boundAt,
      kind: "requisiteBound",
      trader: r.trader,
      requisite: { bank: r.bank, value: r.value },
    });
  }
  return events.sort((a, b) => b.at.localeCompare(a.at));
}

export const counterparties: MockCounterparty[] = Array.from(
  { length: 42 },
  (_, n) => {
    const id = String(between(random, 1_000_000_000, 9_999_999_999));
    const requests = between(random, 20, 900);
    const deals = Math.round(requests * (0.6 + random() * 0.4));
    const paid = Math.round(deals * (0.15 + random() * 0.85));
    const createdAt = subDays(now, between(random, 10, 400));
    const requisites =
      random() > 0.2
        ? Array.from({ length: between(random, 1, 3) }, () =>
            bind(
              pick(kaRequisites),
              pick(bindTypes),
              subDays(now, between(random, 0, 60)),
            ),
          ).sort((a, b) => b.boundAt.localeCompare(a.boundAt))
        : [];
    const average = between(random, 2, 60) * 1000;
    const week = paid * average * 0.05;
    const blacklisted = n % 9 === 4;
    return {
      id,
      merchant: pick(merchants),
      enabled: !blacklisted && random() > 0.12,
      blacklisted,
      autoEnableBlocked: blacklisted || random() > 0.9,
      requisite: requisites[0] ?? null,
      requisites,
      disputes: between(random, 0, 25),
      activity: { paid, deals, requests },
      conversion: Math.round((paid / requests) * 100),
      lastLoginAt:
        random() > 0.1
          ? subHours(now, between(random, 1, 24 * 40)).toISOString()
          : null,
      averageCheck: rub(average),
      deposits: {
        week: rub(week),
        month: rub(week * 4.2),
        all: rub(week * between(random, 10, 40)),
      },
      createdAt: createdAt.toISOString(),
      lastDepositAt:
        paid > 0
          ? subMinutes(now, between(random, 5, 60 * 24 * 30)).toISOString()
          : null,
      events: makeEvents(id, requisites),
    };
  },
);
