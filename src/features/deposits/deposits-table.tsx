import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { cn } from "cn";
import { useState } from "react";
import { type CountTab, CountTabs } from "@/components/count-tabs";
import { LetterAvatar } from "@/components/letter-avatar";
import { StatusBadge } from "@/components/status-badge";
import { SortHeader } from "@/components/table/sort-header";
import { TableMessage } from "@/components/table/table-message";
import { TwoLines } from "@/components/table/two-lines";
import { TxHashDialog } from "@/components/tx-hash-dialog";
import { Button } from "@/components/ui/button";
import { useDialog } from "@/hooks/use-dialog";
import { formatAgo, formatDayMonth, formatTime } from "@/lib/dates";
import { formatAmount, formatNumber, plural, shortId } from "@/lib/format";
import { AmlCell } from "./aml-cell";
import { confirmDeposit, depositsQuery } from "./api";
import { depositStatusMeta } from "./deposit-status";
import {
  type DepositSortField,
  type DepositsSearch,
  depositStatuses,
} from "./schemas";
import type { Deposit, DepositList, DepositStatus } from "./types";

const columns =
  "grid grid-cols-[136px_175px_171px_176px_206px_460px_138px_minmax(0,1fr)] items-center";

const statusTabs = (
  counts: DepositList["counts"] | undefined,
): CountTab<DepositStatus>[] => [
  { value: undefined, label: "Все", count: counts?.all },
  ...depositStatuses.map((status) => ({
    value: status,
    label: depositStatusMeta[status].tab,
    count: counts?.[status],
  })),
];

type DepositsTableProps = {
  search: DepositsSearch;
  onChange: (patch: Partial<DepositsSearch>) => void;
};

export function DepositsTable({ search, onChange }: DepositsTableProps) {
  const { data, isPending, isError, refetch } = useQuery(depositsQuery(search));
  const dialog = useDialog();
  const [confirming, setConfirming] = useState<Deposit | null>(null);
  const queryClient = useQueryClient();
  const confirm = useMutation({
    mutationFn: ({ id, txHash }: { id: string; txHash: string }) =>
      confirmDeposit(id, txHash),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deposits"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const sortHeader = (field: DepositSortField, label: string) => (
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
          label="Статус пополнения"
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
            {sortHeader("number", "Пополнения")}
            <span>Статус</span>
            {sortHeader("user", "Пользователь")}
            {sortHeader("amount", "Сумма")}
            <span>Адрес / tx</span>
            <span>AML</span>
            {sortHeader("createdAt", "Создано")}
            <span>Действие</span>
          </div>

          {isPending ? (
            <TableMessage>Загрузка…</TableMessage>
          ) : isError ? (
            <TableMessage>
              Не удалось загрузить пополнения
              <Button variant="secondary" onClick={() => refetch()}>
                Повторить
              </Button>
            </TableMessage>
          ) : data.items.length === 0 ? (
            <TableMessage>
              {search.q || search.status
                ? "Ничего не найдено"
                : "Пополнений пока нет"}
            </TableMessage>
          ) : (
            <ul>
              {data.items.map((deposit) => (
                <DepositRow
                  key={deposit.id}
                  deposit={deposit}
                  onConfirm={() => {
                    setConfirming(deposit);
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
          title="Подтверждение пополнения"
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

function DepositRow({
  deposit: d,
  onConfirm,
}: {
  deposit: Deposit;
  onConfirm: () => void;
}) {
  const status = depositStatusMeta[d.status];

  return (
    <li
      className={cn(
        columns,
        "border-b border-border/80 px-7 py-4 last:border-b-0",
      )}
    >
      <TwoLines main={`№${d.number}`} sub={`${d.windowMinutes} мин. окно`} />
      <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
      <Link
        to="/admin/users/$userId"
        params={{ userId: d.user.id }}
        className="flex w-fit min-w-0 items-center gap-2 outline-none transition-colors hover:text-primary focus-visible:text-primary"
      >
        <LetterAvatar name={d.user.login} className="rounded-[8px]" />
        <span className="truncate">{d.user.login}</span>
      </Link>
      <TwoLines
        main={
          <>
            {formatNumber(d.amount, "auto")}{" "}
            <span className="text-muted-foreground">USDT</span>
          </>
        }
        sub={`Комиссия ${formatAmount(d.fee, "USDT")} USDT`}
      />
      <TwoLines
        main={<span title={d.address}>{shortId(d.address, 6, 7)}</span>}
        sub={
          <span title={d.txHash ?? undefined}>
            {d.transactions}{" "}
            {plural(d.transactions, ["транзакция", "транзакции", "транзакций"])}
            {d.txHash && ` / ${shortId(d.txHash, 4, 4)}`}
          </span>
        }
      />
      <AmlCell aml={d.aml} />
      <TwoLines
        main={formatAgo(d.createdAt)}
        sub={`${formatDayMonth(d.createdAt)} (${formatTime(d.createdAt)})`}
      />
      {d.status === "problem" ? (
        <Button
          variant="secondary"
          className="h-[38px] w-[99px] rounded-[12px] border-border px-3"
          onClick={onConfirm}
        >
          Зачислить
        </Button>
      ) : (
        <span className="grid h-[38px] w-[99px] place-items-center rounded-[12px] border border-border/40 bg-card/40 font-medium">
          -
        </span>
      )}
    </li>
  );
}
