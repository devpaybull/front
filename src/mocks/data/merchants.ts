import type {
  Attachment,
  Merchant,
  MerchantMethod,
  MerchantMethodState,
} from "@/features/merchants/types";
import type { PaymentMethod } from "@/features/users/types";
import { between, seeded } from "./user-profiles";
import { users } from "./users";

const random = seeded("merchants");
const pick = <T>(items: readonly T[]) =>
  items[between(random, 0, items.length - 1)];

export const payInMethods: PaymentMethod[] = [
  "qr",
  "c2c",
  "ka",
  "sbp",
  "mobile",
];
export const payOutMethods: PaymentMethod[] = ["c2c", "sbp"];

const states: MerchantMethodState[] = [
  "on",
  "on",
  "on",
  "on",
  "off",
  "noTraders",
  "custom",
];

const method = (m: PaymentMethod): MerchantMethod => ({
  method: m,
  state: pick(states),
  volume: String(between(random, 0, 400) * 25_000),
  rate: String(between(random, 6, 14)),
});

const flags = () => ({
  trade: random() > 0.2,
  cards: random() > 0.4,
  sbp: random() > 0.3,
  tgCards: random() > 0.6,
  tgSbp: random() > 0.6,
});

const traders = users.filter(
  (u) => u.role === "trader" || u.role === "lead_trader",
);
const cascadeUsers = users.filter((u) => u.role === "cascade");

function some(from: typeof users, max: number): Attachment[] {
  const count = between(random, 0, max);
  const picked = new Map<string, Attachment>();
  for (let n = 0; n < count; n++) {
    const user = pick(from);
    picked.set(user.id, { id: user.id, login: user.login, flags: flags() });
  }
  return [...picked.values()];
}

export const merchantGroups = [
  { id: "group-1", name: "Группа мерчантов" },
  { id: "group-2", name: "Casino" },
  { id: "group-3", name: "Betting" },
  { id: "group-4", name: "Slots" },
];

const membership: Record<string, string> = {
  Casino: "group-1",
  Vegas_star: "group-1",
  Spin_city: "group-2",
  Ace_poker: "group-2",
  Bet_house_rus: "group-3",
  Fox_bet_24: "group-3",
  Jet_slots: "group-4",
  Gold_rush_rus: "group-4",
};

export const merchants: Merchant[] = users.flatMap((user) => {
  if (user.role !== "merchant" || !user.merchant) return [];
  const { id, name } = user.merchant;
  return [
    {
      id,
      name,
      userId: user.id,
      login: user.login,
      groupId: membership[name] ?? null,
      balance: (between(random, 1000, 9_000_000) / 100).toFixed(2),
      enabled: random() > 0.15,
      exclusive: random() > 0.7,
      payIn: payInMethods.map(method),
      payOut: payOutMethods.map(method),
      traders: some(traders, 3),
      cascades: some(cascadeUsers, 2),
    },
  ];
});
