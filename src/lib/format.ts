const fixed = new Intl.NumberFormat("ru-RU", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const auto = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 });

const formatters = { USDT: fixed, RUB: auto };

export type Currency = keyof typeof formatters;

export function formatAmount(value: string, currency: Currency) {
  return formatters[currency].format(value as Intl.StringNumericLiteral);
}

export function formatNumber(value: string, decimals: "fixed" | "auto") {
  return (decimals === "fixed" ? fixed : auto).format(
    value as Intl.StringNumericLiteral,
  );
}

const pluralRules = new Intl.PluralRules("ru-RU");

export function plural(n: number, [one, few, many]: [string, string, string]) {
  const category = pluralRules.select(n);
  return category === "one" ? one : category === "few" ? few : many;
}

export function shortId(id: string, head = 5, tail = 7) {
  return id.length > head + tail + 4
    ? `${id.slice(0, head)}....${id.slice(-tail)}`
    : id;
}

export function tailId(id: string, tail = 11) {
  return id.length > tail + 3 ? `...${id.slice(-tail)}` : id;
}

export function formatRate(rate: {
  payIn: { min: string; max: string };
  payOut: { min: string; max: string };
}) {
  const range = ({ min, max }: { min: string; max: string }) =>
    `${min}-${max}%`;
  return `${range(rate.payIn)} / ${range(rate.payOut)}`;
}

export function formatKiloUsdt(value: string) {
  const n = Number(value);
  return n >= 1000
    ? `${formatAmount(String(n / 1000), "USDT")} k. USDT`
    : `${formatAmount(value, "USDT")} USDT`;
}
