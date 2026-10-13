import type { TabTone } from "@/components/count-tabs";
import type { UserRole } from "./types";

export const userRoleMeta: Record<UserRole, { label: string; tone: TabTone }> =
  {
    trader: { label: "Трейдер", tone: "blue" },
    lead_trader: { label: "Лид-трейдер", tone: "blue" },
    cascade: { label: "Каскад", tone: "orange" },
    merchant: { label: "Мерчант", tone: "green" },
    merchant_support: { label: "Поддержка мерчантов", tone: "green" },
    merchant_agent: { label: "Агент мерчантов", tone: "green" },
    admin: { label: "Администратор", tone: "neutral" },
    super_admin: { label: "Супер-администратор", tone: "neutral" },
  };

export const userRoleGroups: UserRole[][] = [
  ["trader", "lead_trader"],
  ["cascade"],
  ["merchant", "merchant_support", "merchant_agent"],
  ["admin", "super_admin"],
];

export const userRoles = userRoleGroups.flat();
