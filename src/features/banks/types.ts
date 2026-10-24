export type BankRequisiteType = "p2p" | "sbp" | "card" | "account";

export type Bank = {
  id: string;
  name: string;
  code: string | null;
  country: string | null;
  currency: string;
  crossBorderCurrencies: string[];
  channels: number;
  requisiteTypes: BankRequisiteType[];
  active: boolean;
  automation: boolean;
  multiRequisites: boolean;
  askHolderName: boolean;
};

export type BankList = {
  items: Bank[];
  counts: Record<string, number>;
};

export type BankOptions = { currencies: string[]; countries: string[] };
