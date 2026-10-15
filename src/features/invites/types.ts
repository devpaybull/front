export type InviteStatus = "active" | "used" | "expired";

export type InviteRole = "trader" | "lead";

export type PercentRange = { min: string; max: string };

export type Invite = {
  id: string;
  code: string;
  status: InviteStatus;
  role: InviteRole;
  telegram: string;
  validUntil: string;
  createdAt: string;
  creator: string;
  usedBy: { email: string; at: string } | null;
  rate: { payIn: PercentRange; payOut: PercentRange };
  minInsuranceDeposit: { payIn: string; payOut: string };
};

export type InviteList = {
  counts: Record<InviteStatus | "all", number>;
  items: Invite[];
};
