import type { PaymentMethod } from "./types";

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  c2c: "C2C",
  sbp: "СБП",
  ka: "КА",
  transgran_sbp: "Трансгран (СБП)",
  counterparty_sbp: "Контрагенты (СБП)",
  mobile: "Моб. коммерция",
  qr: "QR",
};
