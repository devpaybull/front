import { useQuery } from "@tanstack/react-query";
import { cn } from "cn";
import { ArrowDown, ArrowUp } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { memo, type Ref } from "react";
import { CountTabs } from "@/components/count-tabs";
import { LetterAvatar } from "@/components/letter-avatar";
import { TableMessage } from "@/components/table/table-message";
import { Button } from "@/components/ui/button";
import { useStableList } from "@/hooks/use-stable-list";
import { formatAmount, shortId } from "@/lib/format";
import { listItemMotion } from "@/lib/motion";
import { inventoryListQuery } from "./api";
import { RequisiteCard, requisiteColumns } from "./requisite-card";
import type { InventoryList, RequisiteKind, TraderInventory } from "./types";

const columns =
  "grid grid-cols-[133px_181px_281px_minmax(0,1fr)] pr-[13px] pl-[26px]";

const EMPTY: TraderInventory[] = [];

type InventoryTableProps = {
  kind: RequisiteKind | undefined;
  onKindChange: (kind: RequisiteKind | undefined) => void;
};

export function InventoryTable({ kind, onKindChange }: InventoryTableProps) {
  const { data, isPending, isError, isPlaceholderData, refetch } = useQuery(
    inventoryListQuery({ kind }),
  );
  const items = useStableList(data?.items ?? EMPTY);

  return (
    <section className="rounded-2xl border border-border/80 bg-panel">
      <KindTabs counts={data?.counts} active={kind} onChange={onKindChange} />

      <div
        className={cn(
          columns,
          "border-b border-border/80 pt-8 pb-5 text-[15px] leading-none font-semibold tracking-[-0.02em]",
        )}
      >
        <span>ID</span>
        <span>Трейдер</span>
        <SortableHeader>Баланс</SortableHeader>
        <div className={`grid ${requisiteColumns} pl-[19px]`}>
          <span>Активные реквизиты</span>
          <SortableHeader>Настройки</SortableHeader>
          <SortableHeader>Лимиты</SortableHeader>
        </div>
      </div>

      {isPending ? (
        <TableMessage>Загрузка…</TableMessage>
      ) : isError ? (
        <TableMessage>
          Не удалось загрузить инвентарь
          <Button variant="secondary" onClick={() => refetch()}>
            Повторить
          </Button>
        </TableMessage>
      ) : items.length === 0 ? (
        <TableMessage>Нет реквизитов</TableMessage>
      ) : (
        <ul
          className={cn(
            "relative transition-opacity",
            isPlaceholderData && "opacity-50",
          )}
        >
          <AnimatePresence mode="popLayout">
            {items.map((item) => (
              <TraderRow key={item.id} item={item} />
            ))}
          </AnimatePresence>
        </ul>
      )}
    </section>
  );
}

const tabs: { kind: RequisiteKind | undefined; label: string }[] = [
  { kind: undefined, label: "Все" },
  { kind: "card", label: "Карты" },
  { kind: "sbp", label: "СБП" },
  { kind: "mobile", label: "Моб. коммерция" },
  { kind: "counterparty", label: "Контрагенты" },
];

function KindTabs({
  counts,
  active,
  onChange,
}: {
  counts: InventoryList["counts"] | undefined;
  active: RequisiteKind | undefined;
  onChange: (kind: RequisiteKind | undefined) => void;
}) {
  return (
    <div className="px-[14px] pt-[14px]">
      <CountTabs
        label="Тип реквизитов"
        tabs={tabs.map((tab) => ({
          value: tab.kind,
          label: tab.label,
          count: counts?.[tab.kind ?? "all"],
        }))}
        value={active}
        onChange={onChange}
      />
    </div>
  );
}

function SortableHeader({ children }: { children: string }) {
  return (
    <span className="flex items-center gap-[7px]">
      {children}
      <ArrowDown className="size-4" strokeWidth={1.5} />
    </span>
  );
}

type TraderRowProps = {
  item: TraderInventory;
  ref?: Ref<HTMLLIElement>;
};

const TraderRow = memo(function TraderRow({ item, ref }: TraderRowProps) {
  const { id, trader, balance, requisites } = item;

  return (
    <motion.li
      ref={ref}
      {...listItemMotion}
      className={cn(
        columns,
        "items-start border-b border-border/80 py-4 leading-none font-semibold tracking-[-0.02em] last:border-b-0",
      )}
    >
      <span title={id} className="pt-5 text-[15px] text-blue underline">
        {shortId(id)}
      </span>

      <span className="flex items-center gap-2 pt-3 text-[15px]">
        <LetterAvatar name={trader.login} />
        {trader.login}
      </span>

      <div className="flex w-fit flex-col gap-2 pt-5">
        <p className="text-[15px]">
          Основной: {formatAmount(balance.main, "USDT")} USDT
        </p>
        <hr className="border-border/80" />
        <div className="flex flex-col gap-1 text-[13px] text-muted-foreground">
          <p className="flex items-center gap-1.5">
            <ArrowDown className="size-[18px]" strokeWidth={1.5} />
            Страховой Pay-in: {formatAmount(balance.insurancePayIn, "USDT")}{" "}
            USDT
          </p>
          <p className="flex items-center gap-1.5">
            <ArrowUp className="size-[18px]" strokeWidth={1.5} />
            Страховой Pay-out: {formatAmount(balance.insurancePayOut, "USDT")}{" "}
            USDT
          </p>
        </div>
      </div>

      <div className="relative flex flex-col gap-4">
        <AnimatePresence mode="popLayout" initial={false}>
          {requisites.map((requisite) => (
            <motion.div key={requisite.id} {...listItemMotion}>
              <RequisiteCard requisite={requisite} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.li>
  );
});
