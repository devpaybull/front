import { addMinutes, subMinutes } from "date-fns";
import { rateBanks } from "@/features/users/profile/rates/banks";
import type {
  BalanceOperation,
  BalanceReason,
  DealStatus,
  EntityRef,
  LogEvent,
  PaymentMethod,
  User,
  UserDeal,
  UserLog,
  UserRequisite,
} from "@/features/users/types";
import { between, seeded } from "./user-profiles";

const trades = (user: User) =>
  user.role === "trader" || user.role === "lead_trader";

const pick = <T>(random: () => number, items: readonly T[]) =>
  items[between(random, 0, items.length - 1)];

const hex = (random: () => number, length: number) =>
  Array.from({ length }, () => "0123456789abcdef"[between(random, 0, 15)]).join(
    "",
  );

const cardNumber = (random: () => number) =>
  Array.from({ length: 4 }, () => String(between(random, 1000, 9999))).join(
    " ",
  );

const phoneNumber = (random: () => number) =>
  `+79${String(between(random, 0, 999999999)).padStart(9, "0")}`;

const timeline = (random: () => number, count: number) => {
  let at = subMinutes(new Date(), between(random, 2, 40));
  return Array.from({ length: count }, () => {
    const current = at;
    at = subMinutes(at, between(random, 20, 600));
    return current;
  });
};

const money = (value: number) => value.toFixed(2);

export function makeBalanceHistory(user: User): BalanceOperation[] {
  if (!trades(user)) return [];
  const random = seeded(`${user.id}-balance`);
  let after = Math.round(Number(user.balance));

  return timeline(random, 40).map((at, i) => {
    let reason: BalanceReason = pick(random, [
      "escrow",
      "escrow",
      "escrow",
      "deposit",
      "withdrawal",
    ] as const);
    let change = between(random, 1, 18) * 50;
    if (reason === "withdrawal" || (reason === "escrow" && random() > 0.5)) {
      change = -change;
    }
    if (after - change < 0) {
      reason = "deposit";
      change = Math.max(1, Math.round(after / 2));
    }
    const before = after - change;
    const operation: BalanceOperation = {
      id: `${hex(random, 4)}${user.id.length}${i}${hex(random, 14)}`,
      createdAt: at.toISOString(),
      reason,
      type: reason === "escrow" ? "deals" : reason,
      amount: money(change),
      balanceBefore: money(before),
      balanceAfter: money(after),
    };
    after = before;
    return operation;
  });
}

const devices = [
  "iPhone 17 Pro Max",
  "Samsung Galaxy S25",
  "MacBook Pro",
  "Xiaomi 14T",
];
const unlinkReasons = [
  "Контрагент перестал отвечать",
  "Жалоба мерчанта на задержки",
  "По просьбе трейдера",
];

export function makeLogs(user: User): UserLog[] {
  const random = seeded(`${user.id}-logs`);
  const events: LogEvent[] = [
    "tradingOn",
    "tradingOff",
    "requisiteAdded",
    "requisiteRemoved",
    "counterpartyLinked",
    "counterpartyUnlinked",
    "deviceAdded",
    "deviceRemoved",
    "telegramLinked",
    "telegramUnlinked",
    "tokenBalanceEmpty",
    "balanceDeposit",
    "balanceWithdrawal",
    "autoBuyoutOn",
    "autoBuyoutOff",
  ];
  const counterparty = () =>
    `ID: ${between(random, 1000000, 9999999)} / Реквизит: ${cardNumber(random)}`;

  return timeline(random, 24).map((at, i) => {
    const event = i < events.length ? events[i] : pick(random, events);
    const details: Partial<Record<LogEvent, string>> = {
      requisiteAdded: cardNumber(random),
      requisiteRemoved: cardNumber(random),
      counterpartyLinked: counterparty(),
      counterpartyUnlinked: counterparty(),
      deviceAdded: pick(random, devices),
      deviceRemoved: pick(random, devices),
      tokenBalanceEmpty: user.login,
      balanceDeposit: `${between(random, 1, 20) * 50} USDT`,
      balanceWithdrawal: `${between(random, 1, 20) * 50} USDT`,
    };
    return {
      id: `${user.id}-log-${i}`,
      createdAt: at.toISOString(),
      event,
      details: details[event] ?? null,
      reason:
        event === "counterpartyUnlinked" ? pick(random, unlinkReasons) : null,
    };
  });
}

const holders = [
  "Шевченко Д.",
  "Иванов И.",
  "Петрова А.",
  "Смирнов К.",
  "Кузнецова М.",
];
const statuses: DealStatus[] = [
  "completed",
  "completed",
  "completed",
  "active",
  "pending",
  "appeal",
  "receiptCheck",
  "manualCheck",
  "recalculated",
  "cancelled",
];
const methods: PaymentMethod[] = [
  "qr",
  "counterparty_sbp",
  "mobile",
  "c2c",
  "sbp",
  "transgran_sbp",
  "ka",
];

export function makeDeals(user: User, merchants: EntityRef[]): UserDeal[] {
  if (!trades(user) || merchants.length === 0) return [];
  const random = seeded(`${user.id}-deals`);
  const processors = [
    { id: user.id, login: user.login },
    ...(user.role === "lead_trader" ? user.dependencies : []),
  ];

  return timeline(random, 36).map((at, i) => {
    const status = i < statuses.length ? statuses[i] : pick(random, statuses);
    const open = status === "active" || status === "pending";
    return {
      id: `${hex(random, 4)}${i}${hex(random, 14)}`,
      createdAt: at.toISOString(),
      deadline: open
        ? addMinutes(new Date(), between(random, 1, 15)).toISOString()
        : null,
      status,
      method: pick(random, methods),
      direction: random() > 0.3 ? "in" : "out",
      amount: money(between(random, 5, 300) * 100),
      processor: pick(random, processors),
      telegram: user.telegram
        ? {
            username: user.telegram,
            group: `${pick(random, ["Mark", "Leo", "Kira"])} / trade_paybull`,
          }
        : null,
      merchant: pick(random, merchants),
      requisite: {
        bank: pick(random, rateBanks),
        holder: pick(random, holders),
        phone: phoneNumber(random),
      },
    };
  });
}

const fullNames = [
  "Иванов Иван Иванович",
  "Петрова Анна Сергеевна",
  "Смирнов Кирилл Олегович",
];

export function makeRequisites(user: User): UserRequisite[] {
  if (!trades(user)) return [];
  const random = seeded(`${user.id}-requisites`);
  const kinds = [
    "sbp",
    "sbp",
    "sbp",
    "card",
    "account",
    "sbp",
    "card",
  ] as const;

  return kinds.map((kind, i) => {
    const dailyTotal = between(random, 20, 60) * 10000;
    const monthlyTotal = between(random, 10, 50) * 100000;
    return {
      id: `${user.id}-req-${i}`,
      enabled: i !== 4,
      kind,
      value:
        kind === "sbp"
          ? phoneNumber(random)
          : kind === "card"
            ? cardNumber(random)
            : `408178105${String(between(random, 0, 99999999999)).padStart(11, "0")}`,
      scope: i === 1 ? "reserve" : random() > 0.3 ? "counterpartiesOnly" : null,
      holder: pick(random, fullNames),
      bank: pick(random, rateBanks),
      total: money(between(random, 100, 9000) * 1000 + random() * 1000),
      trader: { id: user.id, login: user.login },
      amount: {
        min: String(between(random, 1, 10) * 100),
        max: random() > 0.5 ? null : String(between(random, 50, 300) * 1000),
      },
      counterparties: { used: between(random, 0, 2), total: 2 },
      limits: {
        daily: {
          used: String(Math.round(dailyTotal * random())),
          total: String(dailyTotal),
        },
        monthly: {
          used: String(Math.round(monthlyTotal * random())),
          total: String(monthlyTotal),
        },
      },
    };
  });
}
