import { Link } from "@tanstack/react-router";
import { cn } from "cn";
import { motion } from "motion/react";
import { memo, type ReactNode, type Ref, useContext } from "react";
import telegramLogo from "@/assets/icons/telegram.svg";
import { StatusBadge } from "@/components/status-badge";
import { HighlightContext, Highlighted } from "@/components/table/highlighted";
import { TwoLines } from "@/components/table/two-lines";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatDate, formatTime } from "@/lib/dates";
import { formatAmount, formatRate } from "@/lib/format";
import { listItemMotion } from "@/lib/motion";
import { DependenciesCell } from "./dependencies-cell";
import type { User } from "./types";

export const userColumns =
  "grid grid-cols-[203px_146px_252px_463px_166px_172px_minmax(0,1fr)] items-start";

export type UserRowProps = {
  user: User;
  ref?: Ref<HTMLLIElement>;
};

export const UserRow = memo(function UserRow({ user, ref }: UserRowProps) {
  const { minInsuranceDeposit: deposit } = user;

  return (
    <UserRowShell ref={ref} columns={userColumns}>
      <Cell>
        <LoginCell user={user} />
      </Cell>
      <Cell>
        <TwoLines main={formatAmount(user.balance, "USDT")} sub="USDT" />
      </Cell>
      <Cell>
        <TwoLines
          sub="USDT"
          main={`In ${formatAmount(deposit.payIn, "USDT")} / Out ${formatAmount(deposit.payOut, "USDT")}`}
        />
      </Cell>
      <DependenciesCell users={user.dependencies} />
      <Cell>
        <TwoLines main={formatRate(user.rate)} sub="RUB" />
      </Cell>
      <Cell>
        <StatusBadge tone={user.enabled ? "green" : "neutral"}>
          {user.enabled ? "Включен" : "Отключен"}
        </StatusBadge>
      </Cell>
      <Cell>
        <TwoLines
          main={formatDate(user.registeredAt)}
          sub={formatTime(user.registeredAt)}
        />
      </Cell>
    </UserRowShell>
  );
});

function Cell({ children }: { children: ReactNode }) {
  return <div className="flex h-[58px] min-w-0 items-center">{children}</div>;
}

export function UserRowShell({
  columns,
  ref,
  children,
}: {
  columns: string;
  ref?: Ref<HTMLLIElement>;
  children: ReactNode;
}) {
  return (
    <motion.li
      ref={ref}
      {...listItemMotion}
      className="border-b border-border/80 py-1.5 last:border-b-0"
    >
      <div
        className={cn(
          columns,
          "mx-1.5 rounded-[17px] px-[21px] py-2.5 text-[15px] leading-none font-semibold tracking-[-0.02em] transition-colors hover:bg-[#1b2127]/60",
        )}
      >
        {children}
      </div>
    </motion.li>
  );
}

export function LoginCell({ user }: { user: User }) {
  const highlight = useContext(HighlightContext);

  return (
    <div className="flex min-w-0 flex-col gap-1">
      <Tooltip>
        <TooltipTrigger
          render={
            <Link
              to="/admin/users/$userId"
              params={{ userId: user.id }}
              className="w-fit max-w-full truncate outline-none transition-colors hover:text-primary focus-visible:text-primary"
            />
          }
        >
          <Highlighted text={user.login} part={highlight} />
        </TooltipTrigger>
        <TooltipContent align="start" alignOffset={-24} sideOffset={24}>
          Открыть профиль
        </TooltipContent>
      </Tooltip>

      {user.telegram && (
        <a
          href={`https://t.me/${user.telegram.replace(/^@/, "")}`}
          target="_blank"
          rel="noreferrer"
          className="flex w-fit max-w-full items-center gap-1.5 text-[13px] text-muted-foreground underline-offset-2 hover:underline"
        >
          <img src={telegramLogo} alt="" className="size-3.5 shrink-0" />
          <span className="truncate">
            <Highlighted text={user.telegram} part={highlight} />
          </span>
        </a>
      )}
    </div>
  );
}
