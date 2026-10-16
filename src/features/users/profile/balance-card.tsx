import type { ReactNode } from "react";
import ExchangeIcon from "@/assets/icons/exchange.svg?react";
import SortArrowIcon from "@/assets/icons/sort-arrow.svg?react";
import { IconButton } from "@/components/icon-button";
import { Panel } from "@/components/panel";
import { formatAmount } from "@/lib/format";
import type { UserProfile } from "../types";

export function BalanceCard({ user }: { user: UserProfile }) {
  return (
    <Panel className="flex flex-col gap-4 p-7">
      <div className="flex items-start justify-between gap-4 pl-3">
        <div className="flex flex-col gap-2 leading-none font-medium tracking-[-0.02em]">
          <span className="text-[15px] text-muted-foreground">
            Основной баланс
          </span>
          <span className="text-[27px] font-bold">
            {formatAmount(user.balance, "USDT")} USDT
          </span>
        </div>
        <IconButton size="lg" label="Перевести баланс">
          <ExchangeIcon />
        </IconButton>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Deposit
          icon={<SortArrowIcon className="size-5" />}
          title="Страховой Pay-in"
          amount={user.insuranceDeposit.payIn}
          min={user.minInsuranceDeposit.payIn}
        />
        <Deposit
          icon={<SortArrowIcon className="size-5 rotate-180" />}
          title="Страховой Pay-out"
          amount={user.insuranceDeposit.payOut}
          min={user.minInsuranceDeposit.payOut}
        />
      </div>
    </Panel>
  );
}

function Deposit({
  icon,
  title,
  amount,
  min,
}: {
  icon: ReactNode;
  title: string;
  amount: string;
  min: string;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-[10px] bg-[#101419] p-3 leading-none font-medium tracking-[-0.02em]">
      <span className="flex items-center gap-1 text-[15px] text-muted-foreground">
        {icon}
        {title}
      </span>
      <div className="flex items-end justify-between gap-3">
        <span className="text-[19px] font-bold">
          {formatAmount(amount, "USDT")} USDT
        </span>
        <span className="text-[13px] text-muted-foreground">
          мин. {formatAmount(min, "USDT")} USDT
        </span>
      </div>
    </div>
  );
}
