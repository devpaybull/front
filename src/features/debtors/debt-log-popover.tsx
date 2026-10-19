import { useQuery } from "@tanstack/react-query";
import { cn } from "cn";
import type { ReactNode } from "react";
import ArrowDownIcon from "@/assets/icons/arrow-down.svg?react";
import CalendarIcon from "@/assets/icons/calendar.svg?react";
import CardPersonIcon from "@/assets/icons/card-person.svg?react";
import ChevronIcon from "@/assets/icons/chevron-down-20.svg?react";
import CloseIcon from "@/assets/icons/close.svg?react";
import { IconTile, type IconTileTone } from "@/components/icon-tile";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverArrow,
  PopoverClose,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDate, formatTime } from "@/lib/dates";
import { formatAmount, formatNumber } from "@/lib/format";
import { debtLogQuery } from "./api";
import type { DebtLogEntry } from "./types";

const usdt = (value: string) => `${formatAmount(value, "USDT")} USDT`;

const kinds: Record<
  DebtLogEntry["kind"],
  {
    title: string;
    tone: IconTileTone;
    icon: ReactNode;
    text: (amount: string) => string;
  }
> = {
  created: {
    title: "Долг создан",
    tone: "blue",
    icon: <CardPersonIcon />,
    text: (amount) => `Пользователю выдан долг на сумму ${usdt(amount)}`,
  },
  autoDebit: {
    title: "Автосписание",
    tone: "orange",
    icon: <CalendarIcon />,
    text: (amount) => `С баланса автоматически списано ${usdt(amount)}`,
  },
  writeOff: {
    title: "Списание долга",
    tone: "green",
    icon: <ArrowDownIcon />,
    text: (amount) => `С баланса списано ${usdt(amount)}`,
  },
};

export function DebtLogPopover({ debtId }: { debtId: string }) {
  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="secondary"
            className="h-[35px] gap-[7px] rounded-[12px] border-border px-3"
          />
        }
      >
        Лог долга
        <ChevronIcon className="size-[15px] text-foreground/60 transition-transform in-data-popup-open:-rotate-90" />
      </PopoverTrigger>
      <PopoverContent
        side="left"
        sideOffset={14}
        className="w-[374px] gap-0 rounded-[17px] bg-[#15191d] p-5 pl-[21px] text-foreground shadow-drop ring-0"
      >
        <PopoverArrow />
        <DebtLog debtId={debtId} />
      </PopoverContent>
    </Popover>
  );
}

function DebtLog({ debtId }: { debtId: string }) {
  const { data: entries, isPending, isError } = useQuery(debtLogQuery(debtId));

  return (
    <div className="flex flex-col leading-none font-semibold tracking-[-0.02em]">
      <header className="flex items-center justify-between">
        <PopoverTitle className="text-[17px] font-semibold">
          Лог долга
        </PopoverTitle>
        <PopoverClose
          aria-label="Закрыть"
          className="grid size-5 place-items-center rounded-[6px] text-foreground/60 outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          <CloseIcon className="size-[17px]" />
        </PopoverClose>
      </header>
      <p className="mt-2 max-w-[252px] text-[13px] text-muted-foreground">
        История выдач, автосписаний и ручных списаний по текущему долгу
      </p>
      <div className="mt-4">
        {isPending ? (
          <p className="py-6 text-center text-[13px] text-muted-foreground">
            Загрузка…
          </p>
        ) : isError ? (
          <p className="py-6 text-center text-[13px] text-muted-foreground">
            Не удалось загрузить лог
          </p>
        ) : (
          <ScrollArea className={cn(entries.length > 1 && "h-[180px]")}>
            <ul className="flex flex-col gap-3 pr-3.5">
              {entries.map((entry) => (
                <LogEntry key={entry.id} entry={entry} />
              ))}
            </ul>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}

function LogEntry({ entry }: { entry: DebtLogEntry }) {
  const kind = kinds[entry.kind];

  return (
    <li className="flex gap-2 rounded-[11px] bg-[#101419]/80 p-3">
      <IconTile tone={kind.tone}>{kind.icon}</IconTile>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-[15px]">{kind.title}</span>
          <time
            dateTime={entry.createdAt}
            className="shrink-0 text-[11px] text-muted-foreground"
          >
            {formatDate(entry.createdAt)} ({formatTime(entry.createdAt)})
          </time>
        </div>
        <p className="text-[13px] leading-[1.25] text-muted-foreground">
          {kind.text(entry.amount)}
        </p>
        <div className="flex flex-wrap gap-1.5 text-[13px] font-medium">
          {entry.by && (
            <span className="rounded-[8px] bg-blue/10 px-2 py-1 text-blue">
              {entry.by.login}
            </span>
          )}
          <span
            title="Остаток долга"
            className="rounded-[8px] bg-orange/10 px-2 py-1 text-orange"
          >
            {formatNumber(entry.debtAfter, "auto")} USDT
          </span>
        </div>
      </div>
    </li>
  );
}
