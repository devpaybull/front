import { subMinutes } from "date-fns";
import type { Message, MessageType } from "@/features/messages/types";
import { formatNumber } from "@/lib/format";
import { between, seeded } from "./user-profiles";
import { users } from "./users";

const random = seeded("messages");
const pick = <T>(items: readonly T[]) =>
  items[between(random, 0, items.length - 1)];
const hex = (length: number) =>
  Array.from({ length }, () => "0123456789abcdef"[between(random, 0, 15)]).join(
    "",
  );

export const knownSenders = [
  { name: "SBER", address: "900" },
  { name: "T-Bank", address: "Tinkoff" },
  { name: "Beeline", address: "4885" },
  { name: "Alfa-Bank", address: "Alfa" },
  { name: "VTB", address: "VTB" },
];
const devices = ["iPhone 17 Pro Max", "Samsung Galaxy S25", "Xiaomi 14T"];

const texts: Record<MessageType, (amount: string) => string> = {
  sms: (amount) => `Перевод ${amount} р от Иван И. Баланс: 48 210,50 р`,
  push: (amount) => `Поступление ${amount} ₽ на карту *2239`,
  deposit: (amount) => `Зачисление ${amount} RUB по СБП. Отправитель: Пётр С.`,
  statement: () => "Выписка по счёту за период готова, откройте приложение",
};

const firstTypes: MessageType[] = [
  "sms",
  "push",
  "sms",
  "deposit",
  "sms",
  "statement",
  "sms",
  "sms",
];

const traders = users.filter(
  (u) => u.role === "trader" || u.role === "lead_trader",
);

let at = subMinutes(new Date(), 2);

export const messages: Message[] = Array.from({ length: 60 }, (_, i) => {
  const type =
    i < firstTypes.length
      ? firstTypes[i]
      : pick(["sms", "sms", "push", "deposit", "statement"] as const);
  const createdAt = at;
  at = subMinutes(at, between(random, 3, 90));
  const trader = pick(traders);
  const unknown = random() > 0.85;
  const sender = unknown
    ? { name: "Неизвестный", address: `+7 9${between(random, 10, 99)} ***` }
    : pick(knownSenders);
  const amount = String(between(random, 5, 300) * 100);
  return {
    id: `msg-${i + 1}`,
    number: 4214 - i,
    createdAt: createdAt.toISOString(),
    trader: { id: trader.id, login: trader.login, telegram: trader.telegram },
    sender,
    device: pick(devices),
    type,
    text: texts[type](formatNumber(amount, "auto")),
    deal:
      type === "statement" || random() > 0.9
        ? null
        : { id: hex(32), amount, confirmed: i === 3 ? false : random() > 0.2 },
  };
});
