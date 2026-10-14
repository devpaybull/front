import CardIcon from "@/assets/icons/card.svg?react";
import PhoneIcon from "@/assets/icons/phone.svg?react";
import { formatAmount, plural } from "@/lib/format";
import type { Requisite, Usage } from "./types";

export const requisiteColumns = "grid-cols-[218px_179px_minmax(0,1fr)]";

export function RequisiteCard({ requisite }: { requisite: Requisite }) {
  const { bank, cardNumber, phone, amount, counterparties, limits } = requisite;

  return (
    <div
      className={`grid ${requisiteColumns} items-center rounded-[11px] bg-[#101419]/60 py-5 pr-[15px] pl-5 leading-none font-semibold tracking-[-0.02em]`}
    >
      <div className="flex w-fit flex-col gap-2 self-start">
        <p className="text-[15px]">Банк: {bank}</p>
        <hr className="border-border/80" />
        <div className="flex flex-col gap-1 text-[13px] text-muted-foreground">
          {cardNumber && (
            <p className="flex items-center gap-1.5">
              <CardIcon className="size-[18px]" />
              {cardNumber}
            </p>
          )}
          {phone && (
            <p className="flex items-center gap-1.5">
              <PhoneIcon className="size-[18px]" />
              {phone}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <p className="text-[15px]">
          {formatAmount(amount.min, "RUB")} /{" "}
          {amount.max ? formatAmount(amount.max, "RUB") : "∞"}{" "}
          <span className="text-muted-foreground">RUB</span>
        </p>
        <p className="text-[13px]">
          {counterparties.used} / {counterparties.total}{" "}
          <span className="text-muted-foreground">
            {plural(counterparties.total, [
              "контрагент",
              "контрагента",
              "контрагентов",
            ])}
          </span>
        </p>
      </div>

      <div className="flex justify-end gap-2.5">
        <LimitChip label="Сделки" usage={limits.deals} tone="primary" />
        <LimitChip label="Дневной" usage={limits.daily} tone="blue" />
        <LimitChip label="Месячный" usage={limits.monthly} tone="orange" />
      </div>
    </div>
  );
}

const tones = {
  primary: { track: "bg-primary/20", bar: "bg-primary" },
  blue: { track: "bg-blue/20", bar: "bg-blue" },
  orange: { track: "bg-orange/20", bar: "bg-orange" },
};

export function LimitChip({
  label,
  usage,
  tone,
}: {
  label: string;
  usage: Usage;
  tone: keyof typeof tones;
}) {
  const percent = Math.min(
    100,
    Math.round((Number(usage.used) / Number(usage.total)) * 100),
  );

  return (
    <div className="flex flex-col gap-1.5 rounded-[10px] bg-[#1b2127]/60 px-2.5 py-2">
      <div className="flex items-center gap-2.5">
        <span className="min-w-16 text-[15px]">{label}</span>
        <div
          role="progressbar"
          aria-label={label}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
          className={`h-[19px] w-[79px] overflow-hidden rounded-full ${tones[tone].track}`}
        >
          <div
            className={`h-full rounded-full ${tones[tone].bar}`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
      <hr className="border-border/80" />
      <p className="text-xs leading-none text-muted-foreground">
        {formatAmount(usage.used, "RUB")} / {formatAmount(usage.total, "RUB")}{" "}
        RUB
      </p>
    </div>
  );
}
