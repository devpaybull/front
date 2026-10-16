import type { RateCurrency } from "../../currencies";
import { rateAmountSchema, ratePercentSchema } from "../../schemas";
import type { CurrencyRates, PaymentMethod } from "../../types";

export type DraftRange = {
  key: string;
  from: string;
  to: string;
  payIn: string;
  payOut: string;
};
export type DraftBank = {
  key: string;
  bank: string;
  payIn: string;
  payOut: string;
};
export type DraftMethod = {
  method: PaymentMethod;
  payIn: string;
  payOut: string;
  byAmount: DraftRange[];
  byBank: DraftBank[];
};
export type DraftCurrency = { currency: RateCurrency; methods: DraftMethod[] };

let lastKey = 0;
export const newKey = () => `row-${++lastKey}`;

export const groupDigits = (value: string) =>
  /^\d[\d\s]*$/.test(value.trim())
    ? Number(value.replace(/\s/g, "")).toLocaleString("ru-RU")
    : value;

export const toDraft = (rates: CurrencyRates[]): DraftCurrency[] =>
  rates.map(({ currency, methods }) => ({
    currency,
    methods: methods.map((m) => ({
      ...m,
      byAmount: m.byAmount.map((r) => ({
        ...r,
        from: groupDigits(r.from),
        to: groupDigits(r.to),
        key: newKey(),
      })),
      byBank: m.byBank.map((b) => ({ ...b, key: newKey() })),
    })),
  }));

const percent = (value: string) => ratePercentSchema.parse(value);
const amount = (value: string) => rateAmountSchema.parse(value);

export const fromDraft = (draft: DraftCurrency[]): CurrencyRates[] =>
  draft.map(({ currency, methods }) => ({
    currency,
    methods: methods.map((m) => ({
      method: m.method,
      payIn: percent(m.payIn),
      payOut: percent(m.payOut),
      byAmount: m.byAmount.map((r) => ({
        from: amount(r.from),
        to: amount(r.to),
        payIn: percent(r.payIn),
        payOut: percent(r.payOut),
      })),
      byBank: m.byBank.map((b) => ({
        bank: b.bank,
        payIn: percent(b.payIn),
        payOut: percent(b.payOut),
      })),
    })),
  }));

export const isPercent = (value: string) =>
  ratePercentSchema.safeParse(value).success;
const isAmount = (value: string) => rateAmountSchema.safeParse(value).success;
const toNumber = (value: string) => Number(value.replace(/\s/g, ""));

export type RowCheck = {
  ok: boolean;
  message?: string;
  bad: Partial<Record<"from" | "to" | "payIn" | "payOut" | "bank", true>>;
};

const okRow: RowCheck = { ok: true, bad: {} };

function checkPercents(row: { payIn: string; payOut: string }): RowCheck {
  const bad: RowCheck["bad"] = {};
  if (!isPercent(row.payIn)) bad.payIn = true;
  if (!isPercent(row.payOut)) bad.payOut = true;
  return Object.keys(bad).length > 0
    ? { ok: false, message: "Ставка — число от 0 до 100", bad }
    : okRow;
}

export function checkRanges(ranges: DraftRange[]): Map<string, RowCheck> {
  const result = new Map<string, RowCheck>();
  for (const range of ranges) {
    const bad: RowCheck["bad"] = {};
    if (!isAmount(range.from)) bad.from = true;
    if (!isAmount(range.to)) bad.to = true;
    if (bad.from || bad.to) {
      result.set(range.key, {
        ok: false,
        message: "Укажите суммы «От» и «До» — целые числа от 1",
        bad,
      });
    } else if (toNumber(range.from) > toNumber(range.to)) {
      result.set(range.key, {
        ok: false,
        message: "«От» больше, чем «До»",
        bad: { from: true, to: true },
      });
    } else {
      result.set(range.key, checkPercents(range));
    }
  }

  const sorted = ranges
    .filter((r) => result.get(r.key)?.bad.from === undefined)
    .filter((r) => isAmount(r.from) && isAmount(r.to))
    .sort((a, b) => toNumber(a.from) - toNumber(b.from));
  for (let i = 1; i < sorted.length; i++) {
    if (toNumber(sorted[i].from) <= toNumber(sorted[i - 1].to)) {
      const own = result.get(sorted[i].key) ?? okRow;
      result.set(sorted[i].key, {
        ok: false,
        message:
          "Диапазоны будут пересекаться, исправьте ошибку, чтобы продолжить",
        bad: { ...own.bad, from: true },
      });
    }
  }
  return result;
}

export function checkBanks(banks: DraftBank[]): Map<string, RowCheck> {
  const result = new Map<string, RowCheck>();
  const seen = new Set<string>();
  for (const row of banks) {
    if (!row.bank) {
      result.set(row.key, {
        ok: false,
        message: "Выберите банк",
        bad: { bank: true },
      });
    } else if (seen.has(row.bank)) {
      result.set(row.key, {
        ok: false,
        message: "Этот банк уже указан",
        bad: { bank: true },
      });
    } else {
      result.set(row.key, checkPercents(row));
    }
    if (row.bank) seen.add(row.bank);
  }
  return result;
}

export function methodHasErrors(method: DraftMethod) {
  return (
    !isPercent(method.payIn) ||
    !isPercent(method.payOut) ||
    [...checkRanges(method.byAmount).values()].some((c) => !c.ok) ||
    [...checkBanks(method.byBank).values()].some((c) => !c.ok)
  );
}

export const draftHasErrors = (draft: DraftCurrency[]) =>
  draft.some((c) => c.methods.some(methodHasErrors));

export type BarSegment =
  | { kind: "range"; from: number; to: number }
  | { kind: "gap"; from: number; to: number }
  | { kind: "overlap" };

export function rangeBar(ranges: DraftRange[]): BarSegment[] {
  const valid = ranges
    .filter(
      (r) =>
        isAmount(r.from) &&
        isAmount(r.to) &&
        toNumber(r.from) <= toNumber(r.to),
    )
    .map((r) => ({ from: toNumber(r.from), to: toNumber(r.to) }))
    .sort((a, b) => a.from - b.from);

  const segments: BarSegment[] = [];
  valid.forEach((range, index) => {
    const before = valid[index - 1];
    if (before && range.from <= before.to) segments.push({ kind: "overlap" });
    else if (before && range.from > before.to + 1) {
      segments.push({ kind: "gap", from: before.to + 1, to: range.from - 1 });
    }
    segments.push({ kind: "range", ...range });
  });
  return segments;
}

export function nextRange(method: DraftMethod): DraftRange {
  const ends = method.byAmount
    .map((r) => r.to)
    .filter(isAmount)
    .map(toNumber);
  const from = ends.length > 0 ? Math.max(...ends) + 1 : 1;
  return {
    key: newKey(),
    from: groupDigits(String(from)),
    to: "",
    payIn: method.payIn,
    payOut: method.payOut,
  };
}

export const nextBank = (method: DraftMethod): DraftBank => ({
  key: newKey(),
  bank: "",
  payIn: method.payIn,
  payOut: method.payOut,
});

export const emptyMethod = (method: PaymentMethod): DraftMethod => ({
  method,
  payIn: "",
  payOut: "",
  byAmount: [],
  byBank: [],
});
