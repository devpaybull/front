import type {
  EntityRef,
  PaymentMethod,
  UserRef,
  UserRequisite,
} from "@/features/users/types";

export type CounterpartyRequisite = Pick<
  UserRequisite,
  "id" | "kind" | "value" | "holder" | "bank" | "trader"
>;

export type BindType = "cardsOrSbp" | "cards" | "sbp";
export type BindChannel = "sbp" | "card";

export type BoundRequisite = CounterpartyRequisite & {
  bindingId: string;
  bindType: BindType;
  channel: BindChannel;
  boundAt: string;
};

export type Counterparty = {
  id: string;
  merchant: EntityRef;
  enabled: boolean;
  blacklisted: boolean;
  autoEnableBlocked: boolean;
  requisite: BoundRequisite | null;
  disputes: number;
  activity: { paid: number; deals: number; requests: number };
  conversion: number;
  lastLoginAt: string | null;
  averageCheck: string;
  deposits: { week: string; month: string; all: string };
};

export type CounterpartyCounts = {
  all: number;
  active: number;
  disabled: number;
};

export type CounterpartyList = {
  items: Counterparty[];
  counts: CounterpartyCounts;
};

export type CounterpartyFilterOptions = {
  traders: string[];
  merchants: string[];
};

export type CounterpartyDetails = Counterparty & {
  createdAt: string;
  lastDepositAt: string | null;
  requisites: BoundRequisite[];
};

export type CounterpartyStats = {
  conversion: number;
  paidDeals: number;
  totalDeals: number;
  averageCheck: string;
  lastDepositAt: string | null;
  funnel: { requests: number; deals: number; paid: number };
  volume: { week: string; month: string; all: string };
};

export type CounterpartyEventKind =
  | "dealByRequisite"
  | "dealRequest"
  | "dealPaid"
  | "requisiteBound"
  | "requisiteUnbound";

export type CounterpartyEvent = {
  id: string;
  at: string;
  kind: CounterpartyEventKind;
  method?: PaymentMethod;
  amount?: string;
  trader?: UserRef;
  requisite?: { bank: string; value: string };
  dealId?: string;
};

export type CounterpartyEventTab = "deals" | "requisites";

export type CounterpartyEvents = {
  items: CounterpartyEvent[];
  counts: Record<CounterpartyEventTab, number>;
};
