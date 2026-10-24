import type { UserRole } from "@/features/users/types";

export type AccountProfile = {
  id: string;
  login: string;
  role: UserRole;
  createdAt: string;
};

export type TelegramBot = {
  id: string;
  name: string;
  username: string;
  kind: "admin" | "operator";
  description: string;
  commands: string[];
  notifications: string[];
  binding: {
    command: string;
    telegramId: string;
  } | null;
};

export type AccountActivity =
  | { id: string; at: string; kind: "login" | "logout" }
  | { id: string; at: string; kind: "disputeOpened"; dealId: string }
  | {
      id: string;
      at: string;
      kind: "tradingBlocked";
      user: { id: string; login: string };
    }
  | { id: string; at: string; kind: "inviteCreated"; code: string };
