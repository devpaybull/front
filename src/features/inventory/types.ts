export type RequisiteKind = "card" | "sbp" | "mobile" | "counterparty";

export type Usage = { used: string; total: string };

export type Requisite = {
  id: string;
  kind: RequisiteKind;
  bank: string;
  cardNumber: string | null;
  phone: string | null;
  amount: { min: string; max: string | null };
  counterparties: { used: number; total: number };
  limits: { deals: Usage; daily: Usage; monthly: Usage };
};

export type TraderInventory = {
  id: string;
  trader: { id: string; login: string };
  balance: { main: string; insurancePayIn: string; insurancePayOut: string };
  requisites: Requisite[];
};

export type InventoryList = {
  counts: Record<RequisiteKind | "all", number>;
  items: TraderInventory[];
};

export type InventoryStats = {
  availableRequisites: number;
  requisitesInWork: number;
  counterpartiesOnRequisites: { used: number; total: number };
  counterpartiesWithoutRequisite: number;
};

export type Option = { value: string; label: string };

export type InventoryFilterOptions = {
  methods: Option[];
  types: Option[];
  banks: Option[];
  merchants: Option[];
};
