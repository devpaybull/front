import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { cn } from "cn";
import { useState } from "react";
import CascadesIcon from "@/assets/icons/cascades.svg?react";
import { type CountTab, CountTabs } from "@/components/count-tabs";
import { IconCell, IconTile } from "@/components/icon-tile";
import { LetterAvatar } from "@/components/letter-avatar";
import { StatusBadge } from "@/components/status-badge";
import { SortHeader } from "@/components/table/sort-header";
import { TableMessage } from "@/components/table/table-message";
import { TwoLines } from "@/components/table/two-lines";
import { TxHashDialog } from "@/components/tx-hash-dialog";
import { Button } from "@/components/ui/button";
import { useDialog } from "@/hooks/use-dialog";
import { formatDate, formatTime } from "@/lib/dates";
import { formatNumber, shortId } from "@/lib/format";
import { confirmWithdrawal, withdrawalsQuery } from "./api";
import {
  type WithdrawalSortField,
  type WithdrawalsSearch,
  withdrawalStatuses,
} from "./schemas";
import type { Withdrawal, WithdrawalList, WithdrawalStatus } from "./types";
import { withdrawalStatusMeta } from "./withdrawal-status";

const columns =
  "grid grid-cols-[108px_192px_217px_189px_221px_197px_170px_163px_minmax(0,1fr)] items-center";

const statusTabs = (
  counts: WithdrawalList["counts"] | undefined,
): CountTab<WithdrawalStatus>[] => [
  { value: undefined, label: "Все", count: counts?.all },
  ...withdrawalStatuses.map((status) => ({
    value: status,
    label: withdrawalStatusMeta[status].label,
    count: counts?.[status],
  })),
];

const Usdt = ({ value }: { value: string }) => (
  <span>
    {formatNumber(value, "auto")}{" "}
    <span className="text-muted-foreground">USDT</span>
  </span>
);

type WithdrawalsTableProps = {
  search: WithdrawalsSearch;
  onChange: (patch: Partial<WithdrawalsSearch>) => void;
};

export function WithdrawalsTable({ search, onChange }: WithdrawalsTableProps) {
  const { data, isPending, isError, refetch } = useQuery(
    withdrawalsQuery(search),
  );
  const dialog = useDialog();
  const [confirming, setConfirming] = useState<Withdrawal | null>(null);
  const queryClient = useQueryClient();
  const confirm = useMutation({
    mutationFn: ({ id, txHash }: { id: string; txHash: string }) =>
      confirmWithdrawal(id, txHash),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["withdrawals"] }),
  });

  const sortHeader = (field: WithdrawalSortField, label: string) => (
    <SortHeader
      label={label}
      active={search.sort === field}
      ascending={search.order === "asc"}
      onClick={() =>
        onChange(
          search.sort === field
            ? { order: search.order === "asc" ? "desc" : "asc" }
            : { sort: field, order: "asc" },
        )
      }
    />
  );

  return (
    <section className="rounded-2xl border border-border/80 bg-panel">
      <div className="px-4 pt-4">
        <CountTabs
          label="Статус вывода"
          tabs={statusTabs(data?.counts)}
          value={search.status}
          onChange={(status) => onChange({ status })}
        />
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[1615px] text-[15px] leading-none font-semibold tracking-[-0.02em]">
          <div
            className={cn(
              columns,
              "border-b border-border/80 px-7 pt-[30px] pb-4",
            )}
          >
            {sortHeader("number", "ID")}
            <span>Статус</span>
            {sortHeader("user", "Пользователь")}
            <span>Адрес</span>
            {sortHeader("transactions", "Транзакции")}
            {sortHeader("amount", "Сумма")}
            {sortHeader("fee", "Комиссия")}
            {sortHeader("createdAt", "Дата")}
            <span>Действие</span>
          </div>

          {isPending ? (
            <TableMessage>Загрузка…</TableMessage>
          ) : isError ? (
            <TableMessage>
              Не удалось загрузить выводы
              <Button variant="secondary" onClick={() => refetch()}>
                Повторить
              </Button>
            </TableMessage>
          ) : data.items.length === 0 ? (
            <TableMessage>
              {search.q || search.status
                ? "Ничего не найдено"
                : "Выводов пока нет"}
            </TableMessage>
          ) : (
            <ul>
              {data.items.map((withdrawal) => (
                <WithdrawalRow
                  key={withdrawal.id}
                  withdrawal={withdrawal}
                  onConfirm={() => {
                    setConfirming(withdrawal);
                    dialog.show();
                  }}
                />
              ))}
            </ul>
          )}
        </div>
      </div>

      {dialog.mounted && confirming && (
        <TxHashDialog
          key={dialog.key}
          title="Подтверждение вывода"
          open={dialog.open}
          onOpenChange={dialog.onOpenChange}
          onConfirm={(txHash) =>
            confirm.mutateAsync({ id: confirming.id, txHash })
          }
        />
      )}
    </section>
  );
}

function WithdrawalRow({
  withdrawal: w,
  onConfirm,
}: {
  withdrawal: Withdrawal;
  onConfirm: () => void;
}) {
  const status = withdrawalStatusMeta[w.status];

  return (
    <li
      className={cn(
        columns,
        "border-b border-border/80 px-7 py-4 last:border-b-0",
      )}
    >
      <span>№{w.number}</span>
      <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
      <Link
        to="/admin/users/$userId"
        params={{ userId: w.user.id }}
        className="flex w-fit min-w-0 items-center gap-2 outline-none transition-colors hover:text-primary focus-visible:text-primary"
      >
        <LetterAvatar name={w.user.login} className="rounded-[8px]" />
        <span className="truncate">{w.user.login}</span>
      </Link>
      <span title={w.address}>{shortId(w.address, 6, 7)}</span>
      <IconCell
        tile={
          <IconTile tone="primary">
            <CascadesIcon />
          </IconTile>
        }
        main={`${w.transactions} tx`}
        sub={
          w.txHash ? (
            <span title={w.txHash}>{shortId(w.txHash, 6, 7)}</span>
          ) : (
            "нет транзакций"
          )
        }
      />
      <Usdt value={w.amount} />
      <Usdt value={w.fee} />
      <TwoLines
        main={formatDate(w.createdAt)}
        sub={`(${formatTime(w.createdAt)})`}
      />
      {w.status === "queued" || w.status === "error" ? (
        <Button
          variant="secondary"
          className="h-[35px] w-[85px] rounded-[12px] border-border px-3"
          onClick={onConfirm}
        >
          Вывести
        </Button>
      ) : (
        <span className="grid h-[35px] w-[85px] place-items-center rounded-[12px] border border-border/40 bg-card/40 font-medium">
          -
        </span>
      )}
    </li>
  );
}
