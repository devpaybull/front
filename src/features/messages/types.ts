import type { UserRef } from "@/features/users/types";

export type MessageType = "push" | "sms" | "deposit" | "statement";

export type Message = {
  id: string;
  number: number;
  createdAt: string;
  trader: UserRef & { telegram: string | null };
  sender: { name: string; address: string };
  device: string;
  type: MessageType;
  text: string;
  deal: { id: string; amount: string; confirmed: boolean } | null;
};

export type MessageList = {
  counts: Record<MessageType | "all", number>;
  items: Message[];
};

export type MessageFilterOptions = { traders: string[]; senders: string[] };
