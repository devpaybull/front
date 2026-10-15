import { StatusBadge, type StatusTone } from "@/components/status-badge";
import type { InviteRole, InviteStatus } from "./types";

export const inviteStatusMeta: Record<
  InviteStatus,
  { label: string; tab: string; dot: string; tone: StatusTone }
> = {
  active: {
    label: "Активный",
    tab: "Активные",
    dot: "bg-green",
    tone: "green",
  },
  used: {
    label: "Использован",
    tab: "Использованные",
    dot: "bg-blue",
    tone: "blue",
  },
  expired: {
    label: "Истекший",
    tab: "Истекшие",
    dot: "bg-foreground/60",
    tone: "neutral",
  },
};

export const inviteRoleLabels: Record<InviteRole, string> = {
  trader: "Трейдер",
  lead: "Лид",
};

export function InviteStatusBadge({ status }: { status: InviteStatus }) {
  const meta = inviteStatusMeta[status];
  return <StatusBadge tone={meta.tone}>{meta.label}</StatusBadge>;
}
