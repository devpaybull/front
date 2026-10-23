import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { cn } from "cn";
import { type ReactNode, useState } from "react";
import ArrowBackIcon from "@/assets/icons/arrow-back.svg?react";
import BankIcon from "@/assets/icons/bank.svg?react";
import CloseIcon from "@/assets/icons/close.svg?react";
import CopyIcon from "@/assets/icons/copy.svg?react";
import MerchantsIcon from "@/assets/icons/merchants.svg?react";
import statusCancelledUrl from "@/assets/icons/status-cancelled.svg";
import statusDoneUrl from "@/assets/icons/status-done.svg";
import TimeCircleIcon from "@/assets/icons/time-circle.svg?react";
import WalletIcon from "@/assets/icons/wallet.svg?react";
import { CopyButton } from "@/components/copy-button";
import { IconTile, type IconTileTone } from "@/components/icon-tile";
import { JsonCode } from "@/components/json-code";
import { LetterAvatar } from "@/components/letter-avatar";
import { dealMethods } from "@/features/deals/deal-cells";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { errorMessage } from "@/lib/api";
import { formatDate, formatTime } from "@/lib/dates";
import { formatNumber, shortId } from "@/lib/format";
import { requestQuery } from "./api";
import { directionLabels } from "./labels";
import type { MerchantRequestDetails } from "./types";

type PayloadTab = "headers" | "body" | "response";
const payloadTabs: { value: PayloadTab; label: string }[] = [
  { value: "headers", label: "Headers" },
  { value: "body", label: "Body" },
  { value: "response", label: "Response" },
];

export function RequestPanel({
  id,
  onClose,
}: {
  id: string;
  onClose: () => void;
}) {
  const { data, isPending, error } = useQuery(requestQuery(id));

  return (
    <aside
      aria-label="Запрос"
      className="sticky top-[106px] m-3 ml-0 flex max-h-[calc(100svh-118px)] w-[440px] shrink-0 flex-col overflow-y-auto rounded-[11px] bg-[#101419] leading-none font-semibold tracking-[-0.02em]"
    >
      <header className="sticky top-0 z-10 flex justify-between gap-4 bg-[#101419] p-4 pb-3">
        <div className="flex min-w-0 flex-col gap-2">
          <h2 className="flex items-center gap-2 text-[19px] font-bold">
            <span className="truncate">Запрос {shortId(id, 6, 7)}</span>
            <CopyButton text={id} label="Скопировать ID запроса" />
          </h2>
          {data && (
            <p className="text-[15px] font-medium text-muted-foreground">
              {formatTime(data.createdAt, true)} ({formatDate(data.createdAt)})
            </p>
          )}
        </div>
        <button
          type="button"
          aria-label="Закрыть"
          onClick={onClose}
          className="grid size-5 shrink-0 place-items-center rounded-[6px] text-foreground/60 outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          <CloseIcon className="size-5" />
        </button>
      </header>
      {isPending ? (
        <p className="p-4 text-[15px] text-muted-foreground">Загрузка…</p>
      ) : error ? (
        <p className="p-4 text-[15px] text-destructive">
          {errorMessage(error)}
        </p>
      ) : (
        <RequestDetails request={data} />
      )}
    </aside>
  );
}

function Info({
  label,
  tone,
  icon,
  children,
}: {
  label: string;
  tone: IconTileTone;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-2 py-4">
      <span className="text-[15px] text-muted-foreground">{label}</span>
      <span className="flex min-w-0 items-center gap-2 text-[15px]">
        <IconTile tone={tone}>{icon}</IconTile>
        <span className="truncate">{children}</span>
      </span>
    </div>
  );
}

function RequestDetails({ request: r }: { request: MerchantRequestDetails }) {
  const created = r.result === "created";
  const [tab, setTab] = useState<PayloadTab>("body");
  const [wrap, setWrap] = useState(true);
  const [copied, copy] = useCopyToClipboard();
  const payload = { headers: r.headers, body: r.body, response: r.response }[
    tab
  ];
  const text = JSON.stringify(payload, null, 2);
  const kb = new Blob([text]).size / 1024;

  return (
    <div className="flex flex-col gap-6 px-4 pt-3 pb-4">
      <div className="flex flex-col gap-3">
        <div
          className={cn(
            "flex items-center gap-2 rounded-[11px] p-3",
            created ? "bg-green/10" : "bg-destructive/10",
          )}
        >
          <span
            className={cn(
              "grid size-[39px] shrink-0 place-items-center rounded-[8px]",
              created ? "bg-green/10" : "bg-destructive/10",
            )}
          >
            <img
              src={created ? statusDoneUrl : statusCancelledUrl}
              alt=""
              className="size-[21px]"
            />
          </span>
          <div className="flex min-w-0 flex-col gap-1">
            <span className="text-[15px]">
              {created ? "Сделка создана" : "Сделка не создана"}
            </span>
            {r.dealId ? (
              <Link
                to="/admin/deals/$dealId"
                params={{ dealId: r.dealId }}
                className="w-fit text-[13px] text-muted-foreground outline-none transition-colors hover:text-primary focus-visible:text-primary"
              >
                Сделка {shortId(r.dealId, 5, 7)}
              </Link>
            ) : (
              r.errorCode && (
                <span className="truncate text-[13px] text-muted-foreground">
                  {r.errorCode}
                </span>
              )
            )}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            ["Запрос", formatTime(r.createdAt, true)],
            ["Обработка", r.processing],
            ["Результат", created ? "Принят" : "Отклонен"],
          ].map(([label, value]) => (
            <div
              key={label}
              className="flex flex-col gap-2.5 rounded-[10px] bg-[#171c22] p-3 font-medium"
            >
              <span className="text-[13px] text-foreground/60">{label}</span>
              <span className="text-[15px] leading-tight">{value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 border-b border-border/80 [&>*]:border-b [&>*]:border-border/80 [&>*:nth-child(odd)]:border-r [&>*:nth-child(odd)]:pr-4 [&>*:nth-child(even)]:pl-5 [&>*:nth-last-child(-n+2)]:border-b-0 [&>*:nth-child(-n+2)]:pt-0">
        <Info label="Мерчант" tone="orange" icon={<MerchantsIcon />}>
          {r.merchant.name}
        </Info>
        <div className="flex min-w-0 flex-col gap-2 py-4">
          <span className="text-[15px] text-muted-foreground">Обработал</span>
          {r.processor ? (
            <span className="flex min-w-0 items-center gap-2 text-[15px]">
              <LetterAvatar name={r.processor.login} />
              <span className="truncate">{r.processor.login}</span>
            </span>
          ) : (
            <span className="flex h-[31px] items-center text-[15px]">—</span>
          )}
        </div>
        <Info label="Направление" tone="green" icon={<WalletIcon />}>
          {directionLabels[r.direction]}
        </Info>
        <Info label="Сумма" tone="green" icon={<WalletIcon />}>
          {formatNumber(r.amount, "auto")} RUB
        </Info>
        <Info label="Метод" tone="blue" icon={dealMethods[r.method].icon}>
          {r.methodName}
        </Info>
        <Info label="Банк" tone="blue" icon={<BankIcon />}>
          {r.bank ?? "Любой банк"}
        </Info>
        <Info label="Время обработки" tone="primary" icon={<TimeCircleIcon />}>
          {r.processingMs} мс
        </Info>
        <span />
      </div>

      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-3 gap-3">
          {payloadTabs.map((t) => (
            <button
              key={t.value}
              type="button"
              aria-pressed={tab === t.value}
              onClick={() => setTab(t.value)}
              className={cn(
                "h-[37px] rounded-[12px] text-[13px] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                tab === t.value
                  ? "bg-primary/10 text-primary"
                  : "bg-[#1b2127]/60 hover:bg-[#1b2127]",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between gap-3 text-[15px]">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            {kb.toLocaleString("ru-RU", { maximumFractionDigits: 1 })} кб.
            <span aria-hidden className="h-3.5 w-px bg-border/80" />
            {text.split("\n").length} строк
          </span>
          <span className="flex items-center gap-3">
            <button
              type="button"
              aria-pressed={wrap}
              onClick={() => setWrap((w) => !w)}
              className={cn(
                "flex items-center gap-1 outline-none transition-colors focus-visible:underline",
                wrap
                  ? "text-blue"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <ArrowBackIcon className="size-5" />
              Перенос
            </button>
            <span aria-hidden className="h-3.5 w-px bg-border/80" />
            <button
              type="button"
              onClick={() => copy(text)}
              className="flex items-center gap-1 text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:underline"
            >
              <CopyIcon className="size-5" />
              {copied ? "Скопировано" : "Копировать"}
            </button>
          </span>
        </div>
        <JsonCode value={payload} wrap={wrap} />
      </div>
    </div>
  );
}
