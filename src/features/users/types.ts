import type { RateCurrency } from "./currencies";

export type UserRole =
  | "trader"
  | "lead_trader"
  | "cascade"
  | "merchant"
  | "merchant_support"
  | "merchant_agent"
  | "admin"
  | "super_admin";

export type UserRef = { id: string; login: string };

export type EntityRef = { id: string; name: string };

export type User = {
  id: string;
  login: string;
  telegram: string | null;
  role: UserRole;
  token: string;
  balance: string;
  minInsuranceDeposit: { payIn: string; payOut: string };
  dependencies: UserRef[];
  cascade: EntityRef | null;
  merchant: EntityRef | null;
  rate: {
    payIn: { min: string; max: string };
    payOut: { min: string; max: string };
  };
  enabled: boolean;
  registeredAt: string;
};

export type UserList = {
  counts: Record<UserRole | "all", number>;
  items: User[];
};

export type UserSettings = {
  trading: boolean;
  tradingBlocked: boolean;
  payOutTrading: boolean;
  individualRates: boolean;
  autoBuyout: boolean;
  autoBuyoutConcurrent: number;
  nightStopThreshold: number;
  payInAntifraud: boolean;
  qrBuyoutAccess: boolean;
  transferAccess: boolean;
  exclusiveDeposit: boolean;
  exclusiveDepositAttached: number;
  trusted: boolean;
};

export type SettingSwitch = {
  [K in keyof UserSettings]: UserSettings[K] extends boolean ? K : never;
}[keyof UserSettings];

export type UserNote = {
  text: string;
  author: string;
  updatedAt: string;
};

export type UserProfile = User & {
  telegramId: string | null;
  telegramGroups: string[];
  insuranceDeposit: { payIn: string; payOut: string };
  settings: UserSettings;
  note: UserNote | null;
};

export type DayDeals = {
  date: string;
  success: number;
  fail: number;
  dispute: number;
};

export type DayVolume = { date: string; payIn: number; payOut: number };

export type DayPayInRates = {
  date: string;
  conversion: number;
  disputes: number;
};

export type UserStats = {
  deals: DayDeals[];
  volume: DayVolume[];
  payIn: {
    days: DayPayInRates[];
    conversion: number;
    disputes: number;
  };
};

export type PaymentMethod =
  | "c2c"
  | "sbp"
  | "ka"
  | "transgran_sbp"
  | "counterparty_sbp"
  | "mobile"
  | "qr";

export type RatePair = { payIn: string; payOut: string };

export type AmountRate = RatePair & { from: string; to: string };

export type BankRate = RatePair & { bank: string };

export type MethodRates = RatePair & {
  method: PaymentMethod;
  byAmount: AmountRate[];
  byBank: BankRate[];
};

export type CurrencyRates = { currency: RateCurrency; methods: MethodRates[] };

export type UserFingerprint = {
  id: string;
  ip: string;
  country: string;
  fingerprint: string;
  userAgent: string;
  firstSeen: string;
  lastSeen: string;
  seen: number;
};

export type UserReferral = {
  id: string;
  login: string;
  currency: RateCurrency;
  rate: {
    payIn: { min: string; max: string };
    payOut: { min: string; max: string };
  };
};

export type BalanceReason = "escrow" | "deposit" | "withdrawal";

export type BalanceOperation = {
  id: string;
  createdAt: string;
  reason: BalanceReason;
  type: "deals" | "deposit" | "withdrawal";
  amount: string;
  balanceBefore: string;
  balanceAfter: string;
};

export type LogEvent =
  | "tradingOn"
  | "tradingOff"
  | "requisiteAdded"
  | "requisiteRemoved"
  | "counterpartyLinked"
  | "counterpartyUnlinked"
  | "deviceAdded"
  | "deviceRemoved"
  | "telegramLinked"
  | "telegramUnlinked"
  | "tokenBalanceEmpty"
  | "balanceDeposit"
  | "balanceWithdrawal"
  | "autoBuyoutOn"
  | "autoBuyoutOff";

export type UserLog = {
  id: string;
  createdAt: string;
  event: LogEvent;
  details: string | null;
  reason: string | null;
};

export type { Deal as UserDeal, DealStatus } from "@/features/deals/types";

export type UserRequisite = {
  id: string;
  enabled: boolean;
  kind: "sbp" | "card" | "account";
  value: string;
  scope: "counterpartiesOnly" | "reserve" | null;
  holder: string;
  bank: string;
  total: string;
  trader: UserRef;
  amount: { min: string; max: string | null };
  counterparties: { used: number; total: number };
  limits: {
    daily: { used: string; total: string };
    monthly: { used: string; total: string };
  };
};
