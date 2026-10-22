import LinkSlashIcon from "@/assets/icons/link-slash.svg?react";
import { IconTile } from "@/components/icon-tile";
import { BankLogo } from "@/features/deals/bank-logo";
import { bindTypeLabels, requisiteLine } from "./labels";
import type { BoundRequisite } from "./types";

export function RequisiteCell({
  requisite: r,
}: {
  requisite: BoundRequisite | null;
}) {
  if (!r)
    return (
      <div className="flex items-center gap-2">
        <IconTile tone="light" className="text-foreground/60">
          <LinkSlashIcon />
        </IconTile>
        Нет
      </div>
    );
  return (
    <div className="flex min-w-0 items-start gap-2">
      <IconTile tone="light">
        <BankLogo bank={r.bank} />
      </IconTile>
      <div className="flex min-w-0 flex-col gap-1">
        <span>{r.bank}</span>
        <span className="truncate text-[13px] text-muted-foreground">
          {requisiteLine(r)}
        </span>
        <span className="w-fit rounded-[4px] bg-[#1b2127] p-1 text-[13px] text-muted-foreground">
          {bindTypeLabels[r.bindType]}
        </span>
      </div>
    </div>
  );
}
