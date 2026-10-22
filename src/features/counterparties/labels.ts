import type { BindChannel, BindType, CounterpartyRequisite } from "./types";

export const bindTypeLabels: Record<BindType, string> = {
  cardsOrSbp: "Карты или СБП",
  cards: "Только карты",
  sbp: "Только СБП",
};

export const bindChannelLabels: Record<BindChannel, string> = {
  sbp: "СБП",
  card: "Карта",
};

export function shortHolder(name: string) {
  const [last, first] = name.split(" ");
  return first ? `${last} ${first[0]}.` : last;
}

export const requisiteLine = (r: CounterpartyRequisite) =>
  `${shortHolder(r.holder)} (${r.value})`;

export const maskedValue = (value: string) =>
  /^[\d ]{16,}$/.test(value)
    ? `**** ${value.replace(/\s/g, "").slice(-4)}`
    : value;
