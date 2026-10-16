import { useQuery } from "@tanstack/react-query";
import { cn } from "cn";
import { Fragment, useState } from "react";
import ChevronDownIcon from "@/assets/icons/chevron-down.svg?react";
import EyeIcon from "@/assets/icons/eye-open.svg?react";
import { IconButton } from "@/components/icon-button";
import {
  Popover,
  PopoverArrow,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formatAmount } from "@/lib/format";
import { userRatesQuery } from "../api";
import { paymentMethodLabels } from "../payment-methods";
import type { MethodRates } from "../types";

export function RatesPopover({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const { data, isError } = useQuery({
    ...userRatesQuery(userId),
    enabled: open,
  });
  const [currencyIndex, setCurrencyIndex] = useState(0);
  const currency = data?.[currencyIndex] ?? data?.[0];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <IconButton
            label="Показать ставки"
            className="text-foreground data-popup-open:opacity-40"
          />
        }
      >
        <EyeIcon className="size-[21px]" />
      </PopoverTrigger>
      <PopoverContent
        side="top"
        sideOffset={14}
        className="w-[374px] gap-0 rounded-[17px] bg-[#15191d] px-5 pt-5 pb-2 text-[15px] leading-none font-semibold tracking-[-0.02em] text-foreground shadow-[0_4px_32px_rgb(0_0_0/0.25)] ring-0"
      >
        <PopoverArrow />

        <div className="flex items-center gap-[19px]">
          <div className="flex flex-1 gap-2">
            {(data ?? [{ currency: "RUB" }]).map((item, index) => (
              <button
                key={item.currency}
                type="button"
                onClick={() => setCurrencyIndex(index)}
                className={cn(
                  "h-[35px] rounded-[10px] px-2.5 outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  index === currencyIndex
                    ? "bg-[#1e2227]"
                    : "text-muted-foreground",
                )}
              >
                {item.currency}
              </button>
            ))}
          </div>
          <span className="grid h-[35px] w-[46px] place-items-center rounded-[10px] bg-green/10 text-green">
            In
          </span>
          <span className="grid h-[35px] w-[46px] place-items-center rounded-[10px] bg-orange/10 text-orange">
            Out
          </span>
        </div>

        <hr className="mx-1.5 mt-[13px] mb-1 border-border/90" />

        {currency ? (
          <ul>
            {currency.methods.map((rates) => (
              <MethodRow key={rates.method} rates={rates} />
            ))}
          </ul>
        ) : (
          <p className="py-6 text-center text-muted-foreground">
            {isError ? "Не удалось загрузить ставки" : "Загрузка…"}
          </p>
        )}
      </PopoverContent>
    </Popover>
  );
}

function MethodRow({ rates }: { rates: MethodRates }) {
  const [open, setOpen] = useState(false);
  const extra = rates.byAmount.length + rates.byBank.length;
  const label = paymentMethodLabels[rates.method];

  const values = (
    <>
      <span className="w-[46px] text-center text-green">{rates.payIn}%</span>
      <span className="w-[46px] text-center text-orange">{rates.payOut}%</span>
    </>
  );

  return (
    <li>
      {extra > 0 ? (
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
          className="-mx-2 flex w-[calc(100%+16px)] items-center gap-[19px] rounded-[10px] py-2 pr-2 pl-3.5 text-left outline-none transition-colors hover:bg-[#1f242b] focus-visible:bg-[#1f242b]"
        >
          <span className="flex flex-1 items-center gap-1">
            <ChevronDownIcon
              className={cn(
                "size-[15px] shrink-0 transition-transform",
                open && "rotate-180",
              )}
            />
            {label}
            <span className="mr-[-11px] ml-auto rounded bg-[#262a30] px-1 py-0.5 text-[13px] text-muted-foreground">
              +{extra}
            </span>
          </span>
          {values}
        </button>
      ) : (
        <div className="-mx-2 flex items-center gap-[19px] py-2 pr-2 pl-3.5">
          <span className="flex-1">{label}</span>
          {values}
        </div>
      )}

      {open && (
        <div className="-mx-2 my-1.5 flex flex-col gap-6 rounded-[10px] border border-[#22282f] bg-[#1e2227] p-3.5 text-[13px]">
          {rates.byAmount.length > 0 && (
            <Breakdown
              title="По сумме"
              rows={rates.byAmount.map((r) => ({
                key: `${r.from}-${r.to}`,
                label: `${formatAmount(r.from, "RUB")}-${formatAmount(r.to, "RUB")}`,
                payIn: r.payIn,
                payOut: r.payOut,
              }))}
            />
          )}
          {rates.byBank.length > 0 && (
            <Breakdown
              title="По банку"
              rows={rates.byBank.map((r) => ({
                key: r.bank,
                label: r.bank,
                payIn: r.payIn,
                payOut: r.payOut,
              }))}
            />
          )}
        </div>
      )}
    </li>
  );
}

function Breakdown({
  title,
  rows,
}: {
  title: string;
  rows: { key: string; label: string; payIn: string; payOut: string }[];
}) {
  return (
    <div className="flex flex-col gap-3">
      <h4 className="text-muted-foreground">{title}</h4>
      <div className="flex flex-col gap-2">
        {rows.map((row, index) => (
          <Fragment key={row.key}>
            {index > 0 && <hr className="border-border/90" />}
            <div className="flex items-center">
              <span className="flex-1">{row.label}</span>
              <span className="w-[62px] text-green">{row.payIn}%</span>
              <span className="w-[31px] text-right whitespace-nowrap text-orange">
                {row.payOut}%
              </span>
            </div>
          </Fragment>
        ))}
      </div>
    </div>
  );
}
