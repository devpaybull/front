import PercentIcon from "@/assets/icons/percent.svg?react";
import { LetterAvatar } from "@/components/letter-avatar";
import { Tag } from "@/components/tag";
import { Button } from "@/components/ui/button";
import { useDialog } from "@/hooks/use-dialog";
import { formatDate, formatTime } from "@/lib/dates";
import type { UserProfile } from "../types";
import { userRoleMeta } from "../user-role";
import { RatesDialog } from "./rates/rates-dialog";
import { UserActionsMenu } from "./user-actions-menu";

export function ProfileHeader({ user }: { user: UserProfile }) {
  const rates = useDialog();
  const role = userRoleMeta[user.role];
  const { trading } = user.settings;

  return (
    <div className="flex flex-wrap items-center justify-between gap-6">
      <div className="flex min-w-0 items-center gap-2.5">
        <LetterAvatar
          name={user.login}
          className="size-[59px] rounded-[13px] text-[34px]"
        />
        <div className="flex min-w-0 flex-col gap-2">
          <h2 className="truncate text-[19px] leading-none font-bold tracking-[-0.02em]">
            {user.login}
          </h2>
          <div className="flex flex-wrap gap-1.5">
            <Tag size="sm" tone={role.tone}>
              {role.label}
            </Tag>
            {user.settings.tradingBlocked ? (
              <Tag size="sm" tone="red">
                Торговля заблокирована
              </Tag>
            ) : (
              <Tag size="sm" tone={trading ? "green" : "neutral"}>
                {trading ? "Торговля включена" : "Торговля отключена"}
              </Tag>
            )}
            <Tag size="sm" tone="neutral">
              Регистрация: {formatDate(user.registeredAt)} (
              {formatTime(user.registeredAt)})
            </Tag>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <Button
          variant="secondary"
          className="gap-[7px] rounded-[14px] border-border px-6"
          onClick={rates.show}
        >
          <PercentIcon className="size-5" />
          Ставки
        </Button>
        <UserActionsMenu user={user} />
      </div>
      {rates.mounted && (
        <RatesDialog
          key={rates.key}
          userId={user.id}
          open={rates.open}
          onOpenChange={rates.onOpenChange}
        />
      )}
    </div>
  );
}
