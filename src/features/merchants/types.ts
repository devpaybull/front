import type { PaymentMethod, UserRef } from "@/features/users/types";

export type MerchantMethodState = "on" | "off" | "noTraders" | "custom";

export type MerchantMethod = {
  method: PaymentMethod;
  state: MerchantMethodState;
  volume: string;
  rate: string;
};

export type AttachmentFlags = {
  trade: boolean;
  cards: boolean;
  sbp: boolean;
  tgCards: boolean;
  tgSbp: boolean;
};

export type Attachment = UserRef & { flags: AttachmentFlags };

export type MerchantAttachments = {
  traders: Attachment[];
  cascades: Attachment[];
};

type MerchantCommon = {
  id: string;
  name: string;
  balance: string;
  enabled: boolean;
  exclusive: boolean;
  payIn: MerchantMethod[];
  payOut: MerchantMethod[];
};

export type Merchant = MerchantCommon &
  MerchantAttachments & {
    userId: string;
    login: string;
    groupId: string | null;
  };

export type MerchantGroup = MerchantCommon & { merchants: Merchant[] };

export type MerchantListItem =
  | ({ kind: "group" } & MerchantGroup)
  | ({ kind: "merchant" } & Merchant);

export type MerchantList = { items: MerchantListItem[] };

export type MerchantOption = { id: string; name: string };
