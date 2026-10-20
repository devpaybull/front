import { Link } from "@tanstack/react-router";
import { cn } from "cn";
import { differenceInSeconds, parseISO } from "date-fns";
import type { ReactNode } from "react";
import BuyoutsIcon from "@/assets/icons/buyouts.svg?react";
import CalendarIcon from "@/assets/icons/calendar.svg?react";
import CascadesIcon from "@/assets/icons/cascades.svg?react";
import ChevronIcon from "@/assets/icons/chevron-down-20.svg?react";
import DealsIcon from "@/assets/icons/deals.svg?react";
import DocumentPdfIcon from "@/assets/icons/document-pdf.svg?react";
import InventoryIcon from "@/assets/icons/inventory.svg?react";
import MerchantsIcon from "@/assets/icons/merchants.svg?react";
import PhoneIcon from "@/assets/icons/phone.svg?react";
import UserIcon from "@/assets/icons/user.svg?react";
import WalletIcon from "@/assets/icons/wallet.svg?react";
import { CopyButton } from "@/components/copy-button";
import { IconTile, type IconTileTone } from "@/components/icon-tile";
import { LetterAvatar } from "@/components/letter-avatar";
import { formatDate, formatTime } from "@/lib/dates";
import { formatAmount, formatNumber, shortId } from "@/lib/format";
import { useSecondsLeft } from "./countdown";
import { DealQuickActions } from "./deal-actions";
import { dealStatuses } from "./deal-cells";
import { DealCard, DealPanel } from "./deal-panel";
import { CheckCircle } from "./status-circle";
import type { DealDetails, DealHistoryEntry } from "./types";

const borders: Partial<Record<DealDetails["status"], string>> = {
  completed: "border-green/80",
  cancelled: "border-destructive/80",
};

const toneText: Record<IconTileTone, string> = {
  green: "text-green",
  orange: "text-orange",
  blue: "text-blue",
  red: "text-destructive",
  primary: "text-primary",
  telegram: "text-[#26a4e3]",
  light: "text-foreground",
  muted: "text-foreground/60",
};

const dateTime = (iso: string) =>
  `${formatDate(iso)} (${formatTime(iso, true)})`;

export function DealPage({ deal }: { deal: DealDetails }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_395px] items-start gap-5">
      <div className="flex flex-col gap-5">
        <DealInfo deal={deal} />
        <div className="grid grid-cols-2 gap-5">
          <DealFinance deal={deal} />
          <DealPayment deal={deal} />
        </div>
        {deal.files.length > 0 ? (
          <div className="grid grid-cols-[minmax(0,1fr)_376px] items-start gap-5">
            <DealAnalytics deal={deal} />
            <DealFiles files={deal.files} />
          </div>
        ) : (
          <DealAnalytics deal={deal} />
        )}
      </div>
      <div className="flex flex-col gap-5">
        <DealQuickActions deal={deal} />
        <DealParticipants deal={deal} />
        <DealHistory history={deal.history} />
      </div>
    </div>
  );
}

function DealInfo({ deal }: { deal: DealDetails }) {
  const status = dealStatuses[deal.status];
  const running =
    deal.deadline && !["completed", "cancelled"].includes(deal.status);

  return (
    <DealPanel
      title="Основная информация сделки"
      subtitle="Номера, тип, статус сделки"
      className={cn("relative", borders[deal.status] ?? "border-orange/80")}
    >
      {running && deal.deadline && (
        <div className="absolute top-5 right-5">
          <AutoCancelTimer from={deal.createdAt} to={deal.deadline} />
        </div>
      )}
      <div className="flex gap-5">
        <DealNumber label="Внутренний номер сделки" value={deal.id} />
        <DealNumber
          label="Номер сделки у мерчанта"
          value={deal.merchantDealId}
        />
        <DealNumber label="Номер сделки у каскада" value={deal.cascadeDealId} />
      </div>
      <div className="mt-2.5 grid grid-cols-4 gap-2.5">
        <InfoCard
          label="Тип сделки"
          icon={
            deal.kind === "deal" ? (
              <DealsIcon className="size-5" />
            ) : (
              <BuyoutsIcon className="size-5" />
            )
          }
        >
          {deal.kind === "deal" ? "Сделка" : "Откуп"}
        </InfoCard>
        <InfoCard
          label="Статус"
          icon={<span className={toneText[status.tone]}>{status.icon}</span>}
        >
          {status.label}
        </InfoCard>
        <InfoCard
          label="Дата создания"
          icon={<CalendarIcon className="size-5" />}
        >
          {dateTime(deal.createdAt)}
        </InfoCard>
        <InfoCard
          label="Mechant user ID"
          icon={<UserIcon className="size-5" />}
        >
          {deal.merchantUserId}
          <span className="ml-auto text-blue">Перейти</span>
        </InfoCard>
      </div>
    </DealPanel>
  );
}

function DealNumber({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex w-[187px] flex-col gap-2">
      <span className="text-[13px] font-medium text-muted-foreground">
        {label}
      </span>
      <span className="flex h-9 w-fit items-center gap-2.5 rounded-[10px] bg-[#1b2127]/60 px-3.5 text-[15px] font-semibold">
        {value ? (
          <>
            <span title={value}>{shortId(value, 5, 7)}</span>
            <CopyButton text={value} label="Скопировать номер" />
          </>
        ) : (
          "-"
        )}
      </span>
    </div>
  );
}

function InfoCard({
  label,
  icon,
  children,
}: {
  label: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <DealCard className="flex flex-col gap-3">
      <span className="text-[13px] font-medium text-muted-foreground">
        {label}
      </span>
      <span className="flex items-center gap-2 text-[15px] font-semibold">
        {icon}
        {children}
      </span>
    </DealCard>
  );
}

function AutoCancelTimer({ from, to }: { from: string; to: string }) {
  const left = useSecondsLeft(to);
  const total = Math.max(1, differenceInSeconds(parseISO(to), parseISO(from)));
  const part = (value: number, unit: string) => (
    <span className="flex items-baseline gap-[5px]">
      <span className="text-[32px] font-bold tabular-nums">
        {String(value).padStart(2, "0")}
      </span>
      <span className="text-[13px] font-medium text-muted-foreground">
        {unit}
      </span>
    </span>
  );

  return (
    <DealCard className="flex w-[299px] flex-col gap-2.5">
      <span className="text-[13px] font-medium">До авто-отмены:</span>
      <span className="flex items-baseline gap-3">
        {part(Math.floor(left / 60), "мин.")}
        <span className="text-[32px] font-bold">:</span>
        {part(left % 60, "сек.")}
      </span>
      <div
        role="progressbar"
        aria-label="Время до авто-отмены"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={left}
        className="h-[15px] overflow-hidden rounded-full bg-orange/20"
      >
        <div
          className="h-full rounded-full bg-orange transition-[width] duration-1000 ease-linear"
          style={{ width: `${(left / total) * 100}%` }}
        />
      </div>
    </DealCard>
  );
}

function DealFinance({ deal }: { deal: DealDetails }) {
  return (
    <DealPanel
      title="Финансовые параметры сделки"
      subtitle="Основные суммы и курс конвертации сделки"
      aside={
        <span className="mt-1 text-[13px] font-medium text-primary">
          1 USDT ~ {deal.rate} RUB
        </span>
      }
    >
      <div className="grid grid-cols-2 gap-2.5">
        <AmountCard label="К отправке">
          {formatNumber(deal.send, "auto")} USDT
        </AmountCard>
        <AmountCard label="К получению">
          {formatNumber(deal.receive, "auto")} RUB
        </AmountCard>
      </div>
    </DealPanel>
  );
}

function AmountCard({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <DealCard className="flex flex-col gap-3">
      <span className="text-[13px] font-medium text-muted-foreground">
        {label}
      </span>
      <span className="text-2xl font-semibold">{children}</span>
    </DealCard>
  );
}

function DealPayment({ deal }: { deal: DealDetails }) {
  const { payment } = deal;
  return (
    <DealPanel
      title="Платежные данные"
      subtitle="Реквизиты, банк и связанная информация по оплате"
    >
      <DealCard className="flex items-center justify-between gap-3 py-3">
        <span className="flex items-center gap-2">
          <IconTile tone="blue" className="size-[35px]">
            {payment.card ? (
              <InventoryIcon className="size-6" />
            ) : (
              <WalletIcon className="size-6" />
            )}
          </IconTile>
          <span className="flex flex-col gap-1">
            <span className="text-[15px] font-semibold">
              {payment.holder ?? "Без ФИО"}
            </span>
            <span className="text-[13px] font-semibold text-muted-foreground">
              {payment.bank}
            </span>
          </span>
        </span>
        <span className="flex items-center gap-1.5 text-[13px] font-semibold text-muted-foreground">
          {payment.card ? (
            <InventoryIcon className="size-[18px]" />
          ) : (
            <PhoneIcon className="size-[18px]" />
          )}
          {payment.card ?? payment.phone}
        </span>
      </DealCard>
    </DealPanel>
  );
}

function DealAnalytics({ deal }: { deal: DealDetails }) {
  const { fees } = deal;
  const cards = [
    <FeeCard
      key="merchant"
      tone="orange"
      icon={<MerchantsIcon className="size-6" />}
      label="Комиссия мерчанта"
      amount={fees.merchant.amount}
      note={`${fees.merchant.percent} %`}
    />,
    fees.trader && (
      <FeeCard
        key="trader"
        tone="blue"
        icon={<UserIcon className="size-6" />}
        label="Комиссия трейдера"
        amount={fees.trader.amount}
        note={`${fees.trader.percent} %`}
      />
    ),
    fees.cascade && (
      <FeeCard
        key="cascade"
        tone="blue"
        icon={<CascadesIcon className="size-6" />}
        label="Заработок каскада"
        amount={fees.cascade.amount}
        note={`${fees.cascade.percent} %`}
      />
    ),
    fees.leads && (
      <FeeCard
        key="leads"
        tone="primary"
        icon={<UserIcon className="size-6" />}
        label="Комиссия лидов"
        amount={fees.leads.amount}
        note={`${fees.leads.count} шт.`}
      />
    ),
  ].filter(Boolean);

  return (
    <DealPanel
      title="Финансовая аналитика"
      subtitle="Комиссии, доходы и зароботок платформы по сделке"
    >
      <div
        className="grid gap-2.5"
        style={{
          gridTemplateColumns: `repeat(${cards.length}, minmax(0, 1fr))`,
        }}
      >
        {cards}
      </div>
    </DealPanel>
  );
}

function DealFiles({ files }: { files: DealDetails["files"] }) {
  return (
    <DealPanel
      title="Чеки и подтверждающие материалы"
      subtitle="Файлы pay-in, pay-out и материалы по спору"
    >
      <div className="grid grid-cols-2 gap-2.5">
        {files.map((file) => {
          const content = (
            <>
              <IconTile tone="orange" className="size-[35px]">
                <DocumentPdfIcon className="size-6" />
              </IconTile>
              <span
                title={file.name}
                className="line-clamp-2 text-[13px] leading-[1.2] font-medium break-all text-muted-foreground"
              >
                {file.name}
              </span>
            </>
          );
          const card =
            "flex items-center gap-2 rounded-[10px] bg-[#101419] px-5 py-3 min-h-[83px]";
          return file.url ? (
            <a
              key={file.id}
              href={file.url}
              target="_blank"
              rel="noreferrer"
              className={cn(
                card,
                "outline-none transition-colors hover:bg-[#151a20] focus-visible:ring-2 focus-visible:ring-ring",
              )}
            >
              {content}
            </a>
          ) : (
            <div key={file.id} className={card}>
              {content}
            </div>
          );
        })}
      </div>
    </DealPanel>
  );
}

function FeeCard({
  tone,
  icon,
  label,
  amount,
  note,
}: {
  tone: IconTileTone;
  icon: ReactNode;
  label: string;
  amount: string;
  note: string;
}) {
  return (
    <DealCard className="flex items-center justify-between gap-3 py-5">
      <span className="flex items-center gap-2">
        <IconTile tone={tone} className="size-[35px]">
          {icon}
        </IconTile>
        <span className="flex flex-col gap-1.5">
          <span className="text-[13px] font-medium text-muted-foreground">
            {label}
          </span>
          <span className="text-2xl font-semibold">
            {formatAmount(amount, "USDT").replace(",", ".")} USDT
          </span>
        </span>
      </span>
      <span className="text-[13px] font-medium text-muted-foreground">
        {note}
      </span>
    </DealCard>
  );
}

function DealParticipants({ deal }: { deal: DealDetails }) {
  const row =
    "flex items-center justify-between rounded-[10px] bg-[#101419] p-3 outline-none transition-colors hover:bg-[#151a20] focus-visible:ring-2 focus-visible:ring-ring";
  const chevron = (
    <ChevronIcon className="size-4 -rotate-90 text-foreground/60" />
  );

  return (
    <DealPanel
      title="Участники сделки"
      subtitle="Мерчант, трейдер, каскад и контрагент сделки"
    >
      <div className="flex flex-col gap-2.5">
        {deal.processor && (
          <Link
            to="/admin/users/$userId"
            params={{ userId: deal.processor.id }}
            className={row}
          >
            <span className="flex items-center gap-2">
              <LetterAvatar
                name={deal.processor.login}
                className="rounded-[8px]"
              />
              <span className="flex flex-col gap-1">
                <span className="text-[13px] font-medium text-muted-foreground">
                  Трейдер
                </span>
                <span className="text-[15px] font-semibold">
                  {deal.processor.login}
                </span>
              </span>
            </span>
            {chevron}
          </Link>
        )}
        <Link
          to="/admin/merchants/$merchantId"
          params={{ merchantId: deal.merchant.id }}
          className={row}
        >
          <span className="flex items-center gap-2">
            <IconTile tone="orange">
              <MerchantsIcon />
            </IconTile>
            <span className="flex flex-col gap-1">
              <span className="text-[13px] font-medium text-muted-foreground">
                Мерчант
              </span>
              <span className="text-[15px] font-semibold">
                {deal.merchant.name}
              </span>
            </span>
          </span>
          {chevron}
        </Link>
      </div>
    </DealPanel>
  );
}

const historyKinds: Record<
  DealHistoryEntry["kind"],
  { title: string; tone: IconTileTone }
> = {
  created: { title: "Сделка создана", tone: "orange" },
  completed: { title: "Сделка завершена", tone: "green" },
  cancelled: { title: "Сделка отменена", tone: "red" },
  appeal: { title: "Открыт спор", tone: "red" },
  amountChanged: { title: "Сумма изменена", tone: "orange" },
  traderAssigned: { title: "Назначен трейдер", tone: "blue" },
};

function DealHistory({ history }: { history: DealHistoryEntry[] }) {
  return (
    <DealPanel
      title="История сделки"
      subtitle="Хронология статусов и действия сделки"
    >
      <ol className="flex flex-col gap-10">
        {history.map((entry) => {
          const kind = historyKinds[entry.kind];
          return (
            <li key={entry.id} className="flex gap-2">
              <IconTile tone={kind.tone}>
                <CheckCircle className="size-[17px]" />
              </IconTile>
              <div className="flex flex-col gap-1">
                <span
                  className={cn(
                    "text-[15px] font-semibold",
                    toneText[kind.tone],
                  )}
                >
                  {kind.title}
                </span>
                <span className="text-[13px] font-semibold text-muted-foreground">
                  {dateTime(entry.createdAt)}
                </span>
                <span className="text-[13px] font-medium">{entry.text}</span>
              </div>
            </li>
          );
        })}
      </ol>
    </DealPanel>
  );
}
