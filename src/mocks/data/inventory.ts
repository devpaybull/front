import type {
  InventoryFilterOptions,
  Requisite,
  RequisiteKind,
  TraderInventory,
} from "@/features/inventory/types";

export const filterOptions: InventoryFilterOptions = {
  methods: [
    { value: "card", label: "Карта" },
    { value: "sbp", label: "СБП" },
    { value: "mobile", label: "Моб. коммерция" },
  ],
  types: [
    { value: "pay-in", label: "Pay-in" },
    { value: "pay-out", label: "Pay-out" },
  ],
  banks: [
    { value: "tbank", label: "T-банк" },
    { value: "sber", label: "Сбербанк" },
    { value: "alfa", label: "Альфа-банк" },
    { value: "vtb", label: "ВТБ" },
  ],
  merchants: [
    { value: "apeks", label: "Apeks_merch14" },
    { value: "lucky", label: "Lucky_merch02" },
    { value: "royal", label: "Royal_merch07" },
  ],
};

const banks = ["T-банк", "Сбербанк", "Альфа-банк", "ВТБ"];
const kinds: RequisiteKind[] = ["card", "sbp", "mobile", "counterparty"];

function requisite(seed: number): Requisite {
  return {
    id: `req-${seed}`,
    kind: kinds[seed % kinds.length],
    bank: banks[seed % banks.length],
    cardNumber: `2345 5667 4562 ${String(5000 + seed * 37).slice(-4)}`,
    phone: `+7901234${String(5678 + seed).padStart(4, "0")}`,
    amount: { min: "500", max: seed % 3 === 0 ? "150000" : null },
    counterparties: { used: (seed % 3) + 1, total: 3 },
    limits: {
      deals: { used: String(200000 - seed * 9000), total: "450500" },
      daily: { used: String(120000 + seed * 15000), total: "450500" },
      monthly: { used: String(1000000 + seed * 50000), total: "4000500" },
    },
  };
}

const logins = [
  "Super_maks",
  "Ivan_trade",
  "Kassa_pro",
  "Night_owl",
  "Alfa_rider",
  "Monetka",
  "Bull_run",
  "Zero_fee",
];

export const traders: TraderInventory[] = logins.map((login, index) => ({
  id: `fdf32${(index * 7919).toString(16).padStart(8, "0")}a1b2dfsdf3${index}`,
  trader: { id: `trader-${index}`, login },
  balance: {
    main: (25000.5 + index * 1234.25).toFixed(2),
    insurancePayIn: (2000.25 + index * 100).toFixed(2),
    insurancePayOut: (2000.25 + index * 50).toFixed(2),
  },
  requisites: Array.from({ length: (index % 3) + 1 }, (_, n) =>
    requisite(index * 3 + n),
  ),
}));
