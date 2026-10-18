import type { ReactNode } from "react";
import amlSourceUrl from "@/assets/icons/aml-source.svg";
import BalanceScaleIcon from "@/assets/icons/balance-scale.svg?react";
import DicesIcon from "@/assets/icons/dices.svg?react";
import GavelIcon from "@/assets/icons/gavel.svg?react";
import InfoFillIcon from "@/assets/icons/info-fill.svg?react";
import MoneyChangeIcon from "@/assets/icons/money-change.svg?react";
import MoneyDollarIcon from "@/assets/icons/money-dollar.svg?react";
import { IconTile } from "@/components/icon-tile";
import { TwoLines } from "@/components/table/two-lines";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatAgo } from "@/lib/dates";
import type { AmlFlag, Deposit } from "./types";

const flags: Record<AmlFlag, { label: string; icon: ReactNode }> = {
  exchange: { label: "Обменник без KYC", icon: <MoneyChangeIcon /> },
  lawEnforcement: { label: "Правоохранительные органы", icon: <GavelIcon /> },
  gambling: { label: "Азартные игры", icon: <DicesIcon /> },
  sanctions: { label: "Санкции", icon: <BalanceScaleIcon /> },
  scam: { label: "Мошенничество", icon: <MoneyDollarIcon /> },
};

const riskTone = (risk: number) =>
  risk < 10 ? "text-green" : risk < 50 ? "text-orange" : "text-destructive";

export function AmlCell({ aml }: { aml: Deposit["aml"] }) {
  if (!aml) return <span className="text-muted-foreground">Не проверено</span>;

  return (
    <div className="flex items-center">
      <div className="flex w-[194px] shrink-0 items-center gap-2">
        <img
          src={amlSourceUrl}
          alt=""
          className="size-[31px] shrink-0 rounded-[8px]"
        />
        <TwoLines
          main={
            <span title={aml.source} className="block max-w-[155px] truncate">
              {aml.source}
            </span>
          }
          sub={
            <>
              <span className={riskTone(aml.risk)}>{aml.risk}%</span> /{" "}
              {formatAgo(aml.checkedAt)}
            </>
          }
        />
      </div>
      <div className="flex gap-2">
        <FlagTile
          tone="primary"
          icon={<InfoFillIcon />}
          label={
            aml.flags.length > 0 ? (
              <span className="flex flex-col gap-1.5">
                <span className="text-foreground">Найдены риски:</span>
                {aml.flags.map((flag) => (
                  <span key={flag}>{flags[flag].label}</span>
                ))}
              </span>
            ) : (
              "Рисков не найдено"
            )
          }
        />
        {aml.flags.map((flag) => (
          <FlagTile
            key={flag}
            tone="red"
            icon={flags[flag].icon}
            label={flags[flag].label}
          />
        ))}
      </div>
    </div>
  );
}

function FlagTile({
  tone,
  icon,
  label,
}: {
  tone: "primary" | "red";
  icon: ReactNode;
  label: ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <IconTile
            tone={tone}
            hoverable
            role="img"
            aria-label={typeof label === "string" ? label : "Риски AML"}
          />
        }
      >
        {icon}
      </TooltipTrigger>
      <TooltipContent sideOffset={12} className="rounded-[13px] pt-2.5 pb-3">
        {label}
      </TooltipContent>
    </Tooltip>
  );
}
