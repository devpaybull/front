import { format, subDays } from "date-fns";
import type {
  AmountRate,
  BankRate,
  CurrencyRates,
  MethodRates,
  PaymentMethod,
  User,
  UserFingerprint,
  UserNote,
  UserProfile,
  UserReferral,
  UserSettings,
  UserStats,
} from "@/features/users/types";

export function seeded(seed: string) {
  let a = [...seed].reduce(
    (h, c) => Math.imul(h ^ c.charCodeAt(0), 16777619),
    2166136261,
  );
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const between = (random: () => number, min: number, max: number) =>
  Math.round(min + random() * (max - min));

const tenths = (value: number) => Math.round(value * 10) / 10;

export function makeSettings(user: User): UserSettings {
  const random = seeded(`${user.id}-settings`);
  const coin = () => random() > 0.5;
  return {
    trading: user.enabled,
    tradingBlocked: false,
    payOutTrading: coin(),
    individualRates: coin(),
    autoBuyout: coin(),
    autoBuyoutConcurrent: between(random, 1, 5),
    nightStopThreshold: between(random, 1, 5),
    payInAntifraud: coin(),
    qrBuyoutAccess: coin(),
    transferAccess: coin(),
    exclusiveDeposit: coin(),
    exclusiveDepositAttached: random() > 0.6 ? between(random, 1, 4) : 0,
    trusted: coin(),
  };
}

export function makeNote(user: User): UserNote | null {
  if (user.id !== "user-trader-1") return null;
  return {
    text: [
      "394$ заморозил на токене PAY-IN под сделку с @Daniilrichmond",
      "Сделка с @Came00 трейдером",
      "На покупку бычок",
      "У него заморозите 394$ пж",
      "Завтра получит сам проценты",
      "Если всё норм, нам тезор этот перепадёт",
    ].join("\n"),
    author: "leo_marvik",
    updatedAt: subDays(new Date(), 3).toISOString(),
  };
}

export function makeProfile(
  user: User,
  settings: UserSettings,
  note: UserNote | null,
): UserProfile {
  const random = seeded(`${user.id}-profile`);
  const trades = user.role === "trader" || user.role === "lead_trader";
  return {
    ...user,
    telegramId: user.telegram ? String(between(random, 1e8, 999999999)) : null,
    telegramGroups: trades ? ["traders2026", "paybull_push"] : [],
    insuranceDeposit: {
      payIn: random() > 0.5 ? "0" : String(between(random, 100, 1500)),
      payOut: String(between(random, 1, 30) * 50),
    },
    settings,
    note,
  };
}

export function makeStats(user: User): UserStats {
  const random = seeded(`${user.id}-stats`);
  const dates = Array.from({ length: 14 }, (_, i) =>
    format(subDays(new Date(), 13 - i), "yyyy-MM-dd"),
  );
  const payIn = dates.map((date) => ({
    date,
    conversion: tenths(55 + random() * 44),
    disputes: tenths(random() * 25),
  }));
  const average = (values: number[]) =>
    tenths(values.reduce((a, b) => a + b, 0) / values.length);

  return {
    deals: dates.map((date) => ({
      date,
      success: between(random, 30, 110),
      fail: between(random, 0, 14),
      dispute: between(random, 0, 10),
    })),
    volume: dates.map((date) => ({
      date,
      payIn: between(random, 40, 760) * 1000,
      payOut: between(random, 40, 800) * 1000,
    })),
    payIn: {
      days: payIn,
      conversion: average(payIn.map((d) => d.conversion)),
      disputes: average(payIn.map((d) => d.disputes)),
    },
  };
}

const shortRanges = [
  [1, 999],
  [1000, 5000],
  [5001, 10000],
  [10001, 50000],
  [50001, 200000],
];
const longRanges = [
  [1, 999],
  [1000, 2999],
  [3000, 4999],
  [5000, 9999],
  [10000, 19999],
  [20000, 49999],
  [50000, 99999],
  [100000, 200000],
];
const banks = ["Т-банк", "Сбербанк", "Альфа банк", "ВТБ"];

const methodShape: [PaymentMethod, number[][], number][] = [
  ["transgran_sbp", longRanges, 4],
  ["counterparty_sbp", longRanges, 4],
  ["ka", [], 0],
  ["c2c", shortRanges, 3],
  ["mobile", shortRanges.slice(0, 2), 0],
  ["qr", [], 1],
];

export function makeRates(user: User): CurrencyRates[] {
  const random = seeded(`${user.id}-rates`);
  const pct = (min: number, max: number) =>
    String(tenths(min + random() * (max - min)));

  const methods = methodShape.map(
    ([method, ranges, bankCount]): MethodRates => ({
      method,
      payIn: pct(12, 20),
      payOut: "2.5",
      byAmount: ranges.map(
        ([from, to]): AmountRate => ({
          from: String(from),
          to: String(to),
          payIn: pct(5, 12),
          payOut: "2.5",
        }),
      ),
      byBank: banks
        .slice(0, bankCount)
        .map((bank): BankRate => ({ bank, payIn: pct(7, 12), payOut: "2.5" })),
    }),
  );
  return [{ currency: "RUB", methods }];
}

const agents = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/128.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 Safari/17.5",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) Mobile/15E148",
  "Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 Chrome/127.0",
];
const countries = ["Россия", "Россия", "Казахстан", "Беларусь", "Грузия"];

export function makeFingerprints(user: User): UserFingerprint[] {
  const random = seeded(`${user.id}-fingerprints`);
  const hexChars = "0123456789abcdef";
  return Array.from({ length: 10 }, (_, i) => {
    const last = subDays(new Date(), between(random, 0, 30));
    return {
      id: `${user.id}-fp-${i}`,
      ip: [
        between(random, 11, 223),
        between(random, 0, 255),
        between(random, 0, 255),
        between(random, 1, 254),
      ].join("."),
      country: countries[between(random, 0, countries.length - 1)],
      fingerprint: Array.from(
        { length: 32 },
        () => hexChars[between(random, 0, 15)],
      ).join(""),
      userAgent: agents[between(random, 0, agents.length - 1)],
      firstSeen: subDays(last, between(random, 10, 200)).toISOString(),
      lastSeen: last.toISOString(),
      seen: between(random, 1, 2500),
    };
  });
}

export function makeReferrals(user: User): UserReferral[] {
  if (user.role !== "lead_trader") return [];
  const random = seeded(`${user.id}-referrals`);
  return user.dependencies.map((trader) => ({
    id: trader.id,
    login: trader.login,
    currency: "RUB",
    rate: {
      payIn: { min: "0", max: String(between(random, 1, 4)) },
      payOut: { min: "0", max: String(tenths(random() * 1.5)) },
    },
  }));
}
