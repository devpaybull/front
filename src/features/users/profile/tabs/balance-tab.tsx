import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import type { ReactNode } from "react";
import ArrowDownIcon from "@/assets/icons/arrow-down.svg?react";
import ArrowUpIcon from "@/assets/icons/arrow-up.svg?react";
import LockIcon from "@/assets/icons/lock.svg?react";
import { CopyButton } from "@/components/copy-button";
import { ExportButton } from "@/components/export-button";
import {
  PeriodFilterField,
  SelectFilterField,
} from "@/components/filters/filter-fields";
import { FiltersPopover } from "@/components/filters/filters-popover";
import { IconCell, IconTile, type IconTileTone } from "@/components/icon-tile";
import { StatusBadge, type StatusTone } from "@/components/status-badge";
import { TwoLines } from "@/components/table/two-lines";
import { formatDate, formatTime } from "@/lib/dates";
import { formatNumber, shortId } from "@/lib/format";
import { exportUserBalance, userBalanceQuery } from "../../api";
import { balanceReasonLabels, balanceTypeLabels } from "../../balance-reasons";
import { type BalanceSearch, balanceReasons } from "../../schemas";
import type { BalanceOperation, BalanceReason } from "../../types";
import { TabRow, TabTable, tableState } from "./tab-table";
import { TabToolbar } from "./tab-toolbar";

const columns = "grid grid-cols-[145px_669px_190px_185px_209px_minmax(0,1fr)]";

const reasonTiles: Record<
  BalanceReason,
  { tone: IconTileTone; icon: ReactNode }
> = {
  escrow: { tone: "primary", icon: <LockIcon /> },
  deposit: { tone: "green", icon: <ArrowDownIcon /> },
  withdrawal: { tone: "orange", icon: <ArrowUpIcon /> },
};

const typeTones: Record<BalanceOperation["type"], StatusTone> = {
  deals: "blue",
  deposit: "green",
  withdrawal: "orange",
};

const reasonOptions = balanceReasons.map((reason) => ({
  value: reason,
  label: balanceReasonLabels[reason],
}));

const usdt = (value: string) => `${formatNumber(value, "auto")} USDT`;

export function BalanceTab({
  userId,
  search,
  onSearch,
}: {
  userId: string;
  search: BalanceSearch;
  onSearch: (next: BalanceSearch) => void;
}) {
  const query = useQuery(userBalanceQuery(userId, search));
  const filtered = Object.values(search).some(Boolean);

  return (
    <>
      <TabToolbar>
        <ExportButton
          load={() => exportUserBalance(userId, search)}
          fileName={`balance-${userId}-${format(new Date(), "yyyy-MM-dd")}.csv`}
        />
        <FiltersPopover value={search} empty={{}} onApply={onSearch}>
          {(draft, change) => (
            <>
              <PeriodFilterField
                value={draft}
                onChange={({ from, to }) => change({ from, to })}
              />
              <SelectFilterField
                label="Причина"
                allLabel="Все причины"
                options={reasonOptions}
                value={draft.reason}
                onChange={(reason) =>
                  change({ reason: reason as BalanceReason | undefined })
                }
              />
            </>
          )}
        </FiltersPopover>
      </TabToolbar>
      <TabTable
        columns={columns}
        state={tableState(query)}
        emptyText={
          filtered ? "Ничего не нашлось" : "Операций с балансом не было"
        }
        header={
          <>
            <span>Дата</span>
            <span>Причина</span>
            <span>Изменение</span>
            <span>Баланс до</span>
            <span>Баланс после</span>
            <span>Тип операции</span>
          </>
        }
      >
        {query.data?.map((op) => {
          const minus = op.amount.startsWith("-");
          return (
            <TabRow key={op.id} columns={columns}>
              <TwoLines
                main={formatDate(op.createdAt)}
                sub={formatTime(op.createdAt, true)}
              />
              <IconCell
                tile={
                  <IconTile tone={reasonTiles[op.reason].tone}>
                    {reasonTiles[op.reason].icon}
                  </IconTile>
                }
                main={balanceReasonLabels[op.reason]}
                sub={
                  <span className="flex items-center gap-1">
                    #{shortId(op.id, 4, 4)}
                    <CopyButton text={op.id} label="Скопировать ID" />
                  </span>
                }
              />
              <span className={minus ? "text-destructive" : "text-green"}>
                {minus ? "−" : "+"} {usdt(op.amount.replace("-", ""))}
              </span>
              <span>{usdt(op.balanceBefore)}</span>
              <span>{usdt(op.balanceAfter)}</span>
              <StatusBadge tone={typeTones[op.type]}>
                {balanceTypeLabels[op.type]}
              </StatusBadge>
            </TabRow>
          );
        })}
      </TabTable>
    </>
  );
}
