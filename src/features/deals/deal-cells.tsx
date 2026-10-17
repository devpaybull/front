import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import ChevronIcon from "@/assets/icons/chevron-down-20.svg?react";
import ClockBillIcon from "@/assets/icons/clock-bill.svg?react";
import DocumentIcon from "@/assets/icons/document.svg?react";
import GroupIcon from "@/assets/icons/group.svg?react";
import InfoCircleIcon from "@/assets/icons/info-circle.svg?react";
import InventoryIcon from "@/assets/icons/inventory.svg?react";
import MerchantsIcon from "@/assets/icons/merchants.svg?react";
import PhoneIcon from "@/assets/icons/phone-solid.svg?react";
import QrIcon from "@/assets/icons/qr.svg?react";
import statusCancelledUrl from "@/assets/icons/status-cancelled.svg";
import statusDoneUrl from "@/assets/icons/status-done.svg";
import telegramUrl from "@/assets/icons/telegram.svg";
import TimeCircleIcon from "@/assets/icons/time-circle.svg?react";
import Users3Icon from "@/assets/icons/users-3.svg?react";
import { IconCell, IconTile, type IconTileTone } from "@/components/icon-tile";
import { LetterAvatar } from "@/components/letter-avatar";
import { TwoLines } from "@/components/table/two-lines";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { paymentMethodLabels } from "@/features/users/payment-methods";
import type { PaymentMethod } from "@/features/users/types";
import { formatDate, formatTime } from "@/lib/dates";
import { formatAmount, shortId } from "@/lib/format";
import { BankLogo } from "./bank-logo";
import { Countdown } from "./countdown";
import type { Deal, DealKind, DealStatus } from "./types";

export const dealColumns =
  "grid grid-cols-[186px_180px_207px_229px_278px_180px_minmax(0,1fr)_20px]";

export const dealStatuses: Record<
  DealStatus,
  { label: string; tone: IconTileTone; icon: ReactNode }
> = {
  active: { label: "Активная", tone: "green", icon: <TimeCircleIcon /> },
  pending: { label: "В ожидании", tone: "orange", icon: <TimeCircleIcon /> },
  appeal: { label: "Апелляция", tone: "red", icon: <InfoCircleIcon /> },
  receiptCheck: {
    label: "Проверка чека",
    tone: "blue",
    icon: <TimeCircleIcon />,
  },
  manualCheck: {
    label: "Ручная проверка",
    tone: "blue",
    icon: <TimeCircleIcon />,
  },
  recalculated: {
    label: "Пересчитанная",
    tone: "primary",
    icon: <ClockBillIcon />,
  },
  completed: {
    label: "Завершена",
    tone: "green",
    icon: <img src={statusDoneUrl} alt="" className="size-5" />,
  },
  cancelled: {
    label: "Отмененная",
    tone: "red",
    icon: <img src={statusCancelledUrl} alt="" className="size-5" />,
  },
};

export const dealMethods: Record<
  PaymentMethod,
  { tone: IconTileTone; icon: ReactNode }
> = {
  qr: { tone: "orange", icon: <QrIcon /> },
  c2c: { tone: "orange", icon: <InventoryIcon /> },
  counterparty_sbp: { tone: "primary", icon: <Users3Icon /> },
  ka: { tone: "primary", icon: <Users3Icon /> },
  sbp: { tone: "primary", icon: <PhoneIcon /> },
  transgran_sbp: { tone: "primary", icon: <PhoneIcon /> },
  mobile: { tone: "blue", icon: <DocumentIcon /> },
};

const rub = (value: string) => `${formatAmount(value, "RUB")} ₽`;

export function DealCells({
  deal,
  kind = "deal",
}: {
  deal: Deal;
  kind?: DealKind;
}) {
  const status = dealStatuses[deal.status];
  const method = dealMethods[deal.method];
  const methodLabel = paymentMethodLabels[deal.method];

  return (
    <>
      <TwoLines
        main={`${formatDate(deal.createdAt)} (${formatTime(deal.createdAt)})`}
        sub={<span title={deal.id}>#{shortId(deal.id, 4, 4)}</span>}
      />
      <IconCell
        tile={<IconTile tone={status.tone}>{status.icon}</IconTile>}
        main={deal.deadline ? <Countdown to={deal.deadline} /> : "-"}
        sub={status.label}
      />
      <IconCell
        tile={
          <Tooltip>
            <TooltipTrigger
              render={
                <IconTile
                  tone={method.tone}
                  hoverable
                  role="img"
                  aria-label={methodLabel}
                />
              }
            >
              {method.icon}
            </TooltipTrigger>
            <TooltipContent
              sideOffset={12}
              className="rounded-[13px] pt-2.5 pb-3"
            >
              {methodLabel}
            </TooltipContent>
          </Tooltip>
        }
        main={rub(deal.amount)}
        sub={deal.direction === "in" ? "К получению" : "К отправке"}
      />
      {deal.processor ? (
        <Link
          to="/admin/users/$userId"
          params={{ userId: deal.processor.id }}
          className="flex w-fit min-w-0 items-center gap-2 outline-none transition-colors hover:text-primary focus-visible:text-primary"
        >
          <LetterAvatar name={deal.processor.login} className="rounded-[8px]" />
          <span className="truncate">{deal.processor.login}</span>
        </Link>
      ) : (
        <span className="text-muted-foreground">Не назначен</span>
      )}
      {deal.telegram ? (
        <IconCell
          tile={
            <IconTile tone="telegram">
              <img src={telegramUrl} alt="" className="size-4" />
            </IconTile>
          }
          main={deal.telegram.username}
          sub={
            <span className="flex items-center gap-1.5">
              <GroupIcon className="size-3.5" />
              {deal.telegram.group}
            </span>
          }
        />
      ) : (
        <span className="text-muted-foreground">—</span>
      )}
      <Link
        to="/admin/merchants/$merchantId"
        params={{ merchantId: deal.merchant.id }}
        className="flex w-fit min-w-0 items-center gap-2 outline-none transition-colors hover:text-primary focus-visible:text-primary"
      >
        <IconTile tone="orange">
          <MerchantsIcon />
        </IconTile>
        <span className="truncate">{deal.merchant.name}</span>
      </Link>
      <IconCell
        tile={
          <IconTile tone="light">
            <BankLogo bank={deal.requisite.bank} />
          </IconTile>
        }
        main={deal.requisite.bank}
        sub={`${deal.requisite.holder} (${deal.requisite.phone})`}
      />
      <Link
        {...(kind === "deal"
          ? { to: "/admin/deals/$dealId", params: { dealId: deal.id } }
          : { to: "/admin/buyouts/$buyoutId", params: { buyoutId: deal.id } })}
        aria-label={kind === "deal" ? "Открыть сделку" : "Открыть откуп"}
        className="grid size-5 place-items-center rounded-[6px] text-foreground/60 outline-none transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ChevronIcon className="size-5 -rotate-90" />
      </Link>
    </>
  );
}
