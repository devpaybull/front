import { subDays, subMinutes } from "date-fns";
import type { User, UserRef, UserRole } from "@/features/users/types";

const leadLogins = [
  "Super_maks",
  "Fly3210",
  "Megaladon92111",
  "Ivo",
  "psih100",
  "Sashka21",
  "rkrutoi50",
  "opasniy999",
  "trade500",
  "fck_sht",
  "alan_trade",
  "Maks_0001",
];

const traderLogins = [
  "Alex_trade2311",
  "night_owl",
  "ivan_trade",
  "monetka",
  "kassa_pro",
  "bull_run",
  "zero_fee",
  "fast_pay",
  "luckyone",
];

const cascadeUsers = [
  ["Prime_cascade", "Prime_rus161_reg"],
  ["volga_flow", "Volga_pay_reg"],
  ["sib_gate", "Sibir_cascade_02"],
  ["ural_route", "Ural_flow_01"],
  ["msk_main", "Moscow_main_reg"],
  ["kzn_pay", "Kazan_cascade"],
  ["neva_gate", "Neva_pay_reg"],
  ["south_line", "South_rus_reg"],
];

const merchantUsers = [
  ["Apeks_merch14", "Aleks_554rus"],
  ["Lucky_merch02", "Lucky_star_rus"],
  ["Royal_merch07", "Royal_play_77"],
  ["nord_merch", "Nord_games_01"],
  ["gold_merch", "Gold_rush_rus"],
  ["casino_merch", "Casino"],
  ["vegas_merch", "Vegas_star"],
  ["bet_merch", "Bet_house_rus"],
  ["spin_merch", "Spin_city"],
  ["ace_merch", "Ace_poker"],
  ["jet_merch", "Jet_slots"],
  ["fox_merch", "Fox_bet_24"],
];

const merchantStaff: [string, UserRole, string][] = [
  ["support_anna", "merchant_support", "Aleks_554rus"],
  ["support_oleg", "merchant_support", "Lucky_star_rus"],
  ["support_ira", "merchant_support", "Aleks_554rus"],
  ["agent_max", "merchant_agent", "Royal_play_77"],
  ["agent_vera", "merchant_agent", "Nord_games_01"],
];

const otherUsers: [string, UserRole][] = [
  ["Alex_fun", "admin"],
  ["frank500", "admin"],
  ["olga_admin", "admin"],
  ["den_ops", "admin"],
  ["root", "super_admin"],
];

const leads: UserRef[] = leadLogins.map((login, n) => ({
  id: `user-lead-${n + 1}`,
  login,
}));

const leadCounts = [12, 1, 0, 3, 11, 5, 2, 8, 0];

function makeUser(
  id: string,
  login: string,
  role: UserRole,
  n: number,
  extra: Partial<Pick<User, "dependencies" | "cascade" | "merchant">> = {},
): User {
  return {
    id,
    login,
    telegram: n % 7 === 3 ? null : `@${login.toLowerCase().slice(0, 9)}`,
    role,
    token: `tok_${(n * 2654435761).toString(16).slice(-10)}${login.length}`,
    balance: (50000 - (n % 30) * 1375.5).toFixed(2),
    minInsuranceDeposit: {
      payIn: String(500 + (n % 3) * 250),
      payOut: String(500 + (n % 2) * 100),
    },
    dependencies: [],
    cascade: null,
    merchant: null,
    rate: {
      payIn: { min: "0", max: String(10 + (n % 5)) },
      payOut: { min: "0", max: String(1.5 + (n % 3) * 0.5) },
    },
    enabled: n % 3 !== 0,
    registeredAt: subMinutes(
      subDays(new Date(), 5 + n * 3),
      n * 47,
    ).toISOString(),
    ...extra,
  };
}

const traders = traderLogins.map((login, n) =>
  makeUser(`user-trader-${n + 1}`, login, "trader", n, {
    dependencies: leads.slice(0, leadCounts[n]),
  }),
);

const leadTraders = leads.map((lead, n) =>
  makeUser(lead.id, lead.login, "lead_trader", n + 10, {
    dependencies: traders
      .filter((t) => t.dependencies.some((d) => d.id === lead.id))
      .map((t) => ({ id: t.id, login: t.login })),
  }),
);

const cascades = cascadeUsers.map(([login, name], n) =>
  makeUser(`user-cascade-${n + 1}`, login, "cascade", n + 25, {
    cascade: { id: `cascade-${n + 1}`, name },
  }),
);

const merchants = merchantUsers.map(([login, name], n) =>
  makeUser(`user-merchant-${n + 1}`, login, "merchant", n + 40, {
    merchant: { id: `merchant-${n + 1}`, name },
  }),
);

const staff = merchantStaff.map(([login, role, name], n) =>
  makeUser(`user-staff-${n + 1}`, login, role, n + 45, {
    merchant:
      merchants.find((m) => m.merchant?.name === name)?.merchant ?? null,
  }),
);

const others = otherUsers.map(([login, role], n) =>
  makeUser(`user-${n + 1}`, login, role, n + 50),
);

export const users: User[] = [
  ...traders,
  ...leadTraders,
  ...cascades,
  ...merchants,
  ...staff,
  ...others,
];
