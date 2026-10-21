import { cn } from "cn";
import type { ReactNode } from "react";
import ChevronIcon from "@/assets/icons/chevron-down-20.svg?react";
import DocumentIcon from "@/assets/icons/document.svg?react";
import InventoryIcon from "@/assets/icons/inventory.svg?react";
import PhoneIcon from "@/assets/icons/phone-solid.svg?react";
import QrIcon from "@/assets/icons/qr.svg?react";
import Users3Icon from "@/assets/icons/users-3.svg?react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { paymentMethodLabels } from "@/features/users/payment-methods";
import type { PaymentMethod } from "@/features/users/types";
import { formatNumber } from "@/lib/format";
import type { MerchantMethod, MerchantMethodState } from "./types";

const methodChips: Record<PaymentMethod, { label: string; icon: ReactNode }> = {
  qr: { label: "QR", icon: <QrIcon /> },
  c2c: { label: "С2С", icon: <InventoryIcon /> },
  ka: { label: "К/А", icon: <Users3Icon /> },
  counterparty_sbp: { label: "К/А", icon: <Users3Icon /> },
  sbp: { label: "СБП", icon: <PhoneIcon /> },
  transgran_sbp: { label: "СБП", icon: <PhoneIcon /> },
  mobile: { label: "МК", icon: <DocumentIcon /> },
};

const stateMeta: Record<MerchantMethodState, { label: string; tone: string }> =
  {
    on: { label: "работает", tone: "bg-green/10 text-green" },
    off: { label: "выключен", tone: "bg-destructive/10 text-destructive" },
    noTraders: { label: "нет трейдеров", tone: "bg-orange/10 text-orange" },
    custom: { label: "своя ставка", tone: "bg-blue/10 text-blue" },
  };

export function MethodChip({ method }: { method: MerchantMethod }) {
  const chip = methodChips[method.method];
  const state = stateMeta[method.state];
  return (
    <span
      title={`${paymentMethodLabels[method.method]}: ${state.label}`}
      className={cn(
        "flex h-[25px] w-fit shrink-0 items-center gap-1 rounded-[8px] px-1.5 text-[13px] [&_svg]:size-[17px]",
        state.tone,
      )}
    >
      {chip.icon}
      {chip.label}
    </span>
  );
}

const box = "rounded-[12px] bg-[#101419]";

export function MethodsCell({
  title,
  methods,
  className,
}: {
  title: string;
  methods: MerchantMethod[];
  className?: string;
}) {
  return (
    <Popover>
      <PopoverTrigger
        aria-label={`${title}: ставки и суммы`}
        className={cn(
          box,
          "flex h-[37px] w-fit items-center gap-4 bg-[#101419]/50 pr-2 pl-1.5 outline-none transition-colors hover:bg-[#101419] focus-visible:ring-2 focus-visible:ring-ring data-popup-open:invisible",
          className,
        )}
      >
        <span className="flex gap-1">
          {methods.map((m) => (
            <MethodChip key={m.method} method={m} />
          ))}
        </span>
        <ChevronIcon className="ml-auto size-5 shrink-0 text-foreground/60" />
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={({ anchor }) => -anchor.height}
        className={cn(
          box,
          "w-[350px] gap-0 p-0 pb-1.5 text-[13px] leading-none font-semibold tracking-[-0.02em] shadow-drop ring-0",
        )}
      >
        <div className="grid grid-cols-[100px_127px_minmax(0,1fr)_20px] items-center pt-[9px] pr-3 pb-[7px] pl-3">
          <span>Метод</span>
          <span>Сумма (RUB)</span>
          <span>Ставка</span>
          <ChevronIcon className="size-5 rotate-180 text-foreground/60" />
        </div>
        <ul className="flex flex-col gap-3">
          {methods.map((m) => (
            <li
              key={m.method}
              className="grid grid-cols-[106px_127px_minmax(0,1fr)] items-center pl-1.5"
            >
              <MethodChip method={m} />
              <span>{formatNumber(m.volume, "auto")}</span>
              <span>{m.rate}%</span>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
