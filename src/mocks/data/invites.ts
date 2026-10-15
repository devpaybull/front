import { addDays, format, startOfToday, subDays } from "date-fns";
import type { Invite, InviteStatus } from "@/features/invites/types";

const iso = (date: Date) => format(date, "yyyy-MM-dd");
const today = startOfToday();

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export function generateInviteCode() {
  let code = "";
  for (let i = 0; i < 12; i++) {
    code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return `INVITE-${code}`;
}

const statuses: InviteStatus[] = ["active", "used", "active", "expired"];
const creators = ["frank500", "Alex_fun", "Kassa_pro"];
const handles = ["@trust221", "@night_owl", "@ivan_trade", "@monetka"];

export const invites: Invite[] = Array.from({ length: 18 }, (_, n) => {
  const status = statuses[n % statuses.length];
  const validUntil =
    status === "expired" ? subDays(today, 3 + n) : addDays(today, 10 + n * 7);
  return {
    id: `invite-${n + 1}`,
    code: `INVITE-SDFKH2123${String(10 + n).padStart(2, "0")}SA`,
    status,
    role: n % 5 === 0 ? "lead" : "trader",
    telegram: handles[n % handles.length],
    validUntil: iso(validUntil),
    createdAt: subDays(today, 30 - n).toISOString(),
    creator: creators[n % creators.length],
    usedBy:
      status === "used"
        ? {
            email: "darklogin@gmail.com",
            at: subDays(today, 5 + n).toISOString(),
          }
        : null,
    rate: {
      payIn: { min: "0", max: String(10 + (n % 5)) },
      payOut: { min: "0", max: (1.5 + (n % 3) * 0.5).toFixed(1) },
    },
    minInsuranceDeposit: {
      payIn: String(500 + (n % 4) * 250),
      payOut: String(500 + (n % 3) * 100),
    },
  };
});
