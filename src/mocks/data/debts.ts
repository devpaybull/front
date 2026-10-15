import { addDays, format, subDays, subHours } from "date-fns";
import type { Debt, DebtLogEntry } from "@/features/debtors/types";
import type { User } from "@/features/users/types";
import { demoAccounts } from "./auth";
import { between, seeded } from "./user-profiles";
import { users } from "./users";

const random = seeded("debts");
const pick = <T>(items: readonly T[]) =>
  items[between(random, 0, items.length - 1)];

const comments = [
  "Довереный трейдер, необходимо было срочно дать в долг, есть переписка в тг",
  "Под сделку с крупным мерчантом, вернёт после выплаты",
  null,
  null,
  null,
];

const issuers = demoAccounts.map(({ user }) => ({
  id: user.id,
  login: user.login,
  role: user.role,
}));

const debtors = users.filter(
  (u) => u.role === "trader" || u.role === "lead_trader",
);

export const debtLogs = new Map<string, DebtLogEntry[]>();

export const debts: Debt[] = Array.from({ length: 14 }, (_, i) => {
  const user = debtors[i % debtors.length];
  const issuedBy = pick(issuers);
  const given = between(random, 2, 120) * 500;
  const createdAt = subHours(subDays(new Date(), between(random, 6, 40)), i);
  const id = `debt-${i + 1}`;

  let owed = given;
  const log: DebtLogEntry[] = [
    {
      id: `${id}-0`,
      createdAt: createdAt.toISOString(),
      kind: "created",
      amount: given.toFixed(2),
      debtAfter: given.toFixed(2),
      by: issuedBy,
    },
  ];
  for (let step = 1; step <= between(random, 0, 2); step++) {
    const back = Math.round(owed * (0.1 + random() * 0.3));
    owed -= back;
    const auto = random() > 0.5;
    log.unshift({
      id: `${id}-${step}`,
      createdAt: addDays(createdAt, step * 2).toISOString(),
      kind: auto ? "autoDebit" : "writeOff",
      amount: back.toFixed(2),
      debtAfter: owed.toFixed(2),
      by: auto ? null : issuedBy,
    });
  }
  debtLogs.set(id, log);

  return {
    id,
    user: { id: user.id, login: user.login, telegram: user.telegram },
    issuedBy,
    amount: owed.toFixed(2),
    comment: i === 1 ? comments[0] : pick(comments),
    autoDebitOn:
      i === 1 || random() > 0.7
        ? format(addDays(new Date(), between(random, 3, 30)), "yyyy-MM-dd")
        : null,
    createdAt: createdAt.toISOString(),
  };
});

export function lendInMocks(user: User, amount: string) {
  const by = demoAccounts[0].user;
  const issuedBy = { id: by.id, login: by.login, role: by.role };
  const existing = debts.find((d) => d.user.id === user.id);
  const debt: Debt = existing ?? {
    id: `debt-${Date.now()}`,
    user: { id: user.id, login: user.login, telegram: user.telegram },
    issuedBy,
    amount: "0.00",
    comment: null,
    autoDebitOn: null,
    createdAt: new Date().toISOString(),
  };
  debt.amount = (Number(debt.amount) + Number(amount)).toFixed(2);
  if (!existing) debts.unshift(debt);
  const log = debtLogs.get(debt.id) ?? [];
  log.unshift({
    id: `${debt.id}-${Date.now()}`,
    createdAt: new Date().toISOString(),
    kind: "created",
    amount: Number(amount).toFixed(2),
    debtAfter: debt.amount,
    by: issuedBy,
  });
  debtLogs.set(debt.id, log);
}
