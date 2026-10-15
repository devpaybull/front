import type { UserRef, UserRole } from "@/features/users/types";

export type Debt = {
  id: string;
  user: UserRef & { telegram: string | null };
  issuedBy: UserRef & { role: UserRole };
  amount: string;
  comment: string | null;
  autoDebitOn: string | null;
  createdAt: string;
};

export type DebtLogEntry = {
  id: string;
  createdAt: string;
  kind: "created" | "autoDebit" | "writeOff";
  amount: string;
  debtAfter: string;
  by: UserRef | null;
};
