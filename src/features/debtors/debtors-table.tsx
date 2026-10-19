import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { cn } from "cn";
import { useState } from "react";
import ArrowDownIcon from "@/assets/icons/arrow-down.svg?react";
import EditIcon from "@/assets/icons/edit.svg?react";
import PauseIcon from "@/assets/icons/pause-circle.svg?react";
import PersonCheckIcon from "@/assets/icons/person-check.svg?react";
import PlayIcon from "@/assets/icons/play-circle.svg?react";
import telegramUrl from "@/assets/icons/telegram.svg";
import { IconTile } from "@/components/icon-tile";
import { LetterAvatar } from "@/components/letter-avatar";
import { SortHeader } from "@/components/table/sort-header";
import { TableMessage } from "@/components/table/table-message";
import { TwoLines } from "@/components/table/two-lines";
import { Button } from "@/components/ui/button";
import { userRoleMeta } from "@/features/users/user-role";
import { useDialog } from "@/hooks/use-dialog";
import { formatDate } from "@/lib/dates";
import { formatNumber } from "@/lib/format";
import { debtsQuery, updateDebt } from "./api";
import { AutoDebitDialog } from "./auto-debit-dialog";
import { CommentDialog } from "./comment-dialog";
import { DebtLogPopover } from "./debt-log-popover";
import type { DebtorsSearch, DebtSortField } from "./schemas";
import type { Debt } from "./types";
import { useDebtMutation } from "./use-debt-mutation";
import { WriteOffDialog } from "./write-off-dialog";

const columns =
  "grid grid-cols-[215px_222px_171px_401px_316px_minmax(0,1fr)] items-center";

const squareButton =
  "size-[35px] shrink-0 rounded-[12px] border-border p-0 [&_svg:not([class*='size-'])]:size-5";

const chip =
  "inline-flex h-[35px] shrink-0 items-center justify-center rounded-[12px] px-3 font-medium";

type Opened = { debt: Debt; dialog: "comment" | "autoDebit" | "writeOff" };

type DebtorsTableProps = {
  search: DebtorsSearch;
  onChange: (patch: Partial<DebtorsSearch>) => void;
};

export function DebtorsTable({ search, onChange }: DebtorsTableProps) {
  const { data, isPending, isError, refetch } = useQuery(debtsQuery(search));
  const dialog = useDialog();
  const [opened, setOpened] = useState<Opened | null>(null);
  const open = (debt: Debt, kind: Opened["dialog"]) => {
    setOpened({ debt, dialog: kind });
    dialog.show();
  };

  const sortHeader = (field: DebtSortField, label: string) => (
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

  const dialogProps = opened && {
    debt: opened.debt,
    open: dialog.open,
    onOpenChange: dialog.onOpenChange,
  };

  return (
    <section className="rounded-2xl border border-border/80 bg-panel">
      <div className="overflow-x-auto">
        <div className="min-w-[1615px] text-[15px] leading-none font-semibold tracking-[-0.02em]">
          <div
            className={cn(columns, "border-b border-border/80 px-7 pt-6 pb-4")}
          >
            {sortHeader("user", "Пользователь")}
            <span>Кто выдал</span>
            {sortHeader("amount", "Сумма долга")}
            <span>Комментарий</span>
            <span>Автосписание</span>
            <span>Действие</span>
          </div>

          {isPending ? (
            <TableMessage>Загрузка…</TableMessage>
          ) : isError ? (
            <TableMessage>
              Не удалось загрузить должников
              <Button variant="secondary" onClick={() => refetch()}>
                Повторить
              </Button>
            </TableMessage>
          ) : data.length === 0 ? (
            <TableMessage>
              {search.q ? "Ничего не найдено" : "Должников нет"}
            </TableMessage>
          ) : (
            <ul>
              {data.map((debt) => (
                <DebtRow key={debt.id} debt={debt} onOpen={open} />
              ))}
            </ul>
          )}
        </div>
      </div>

      {dialogProps && opened.dialog === "comment" && (
        <CommentDialog key={dialog.key} {...dialogProps} />
      )}
      {dialogProps && opened.dialog === "autoDebit" && (
        <AutoDebitDialog key={dialog.key} {...dialogProps} />
      )}
      {dialogProps && opened.dialog === "writeOff" && (
        <WriteOffDialog key={dialog.key} {...dialogProps} />
      )}
    </section>
  );
}

function DebtRow({
  debt,
  onOpen,
}: {
  debt: Debt;
  onOpen: (debt: Debt, dialog: Opened["dialog"]) => void;
}) {
  const stopAutoDebit = useDebtMutation(() =>
    updateDebt(debt.id, { autoDebitOn: null }),
  );
  const { user, issuedBy } = debt;

  return (
    <li
      className={cn(
        columns,
        "border-b border-border/80 px-7 py-4 last:border-b-0",
      )}
    >
      <div className="flex min-w-0 items-center gap-2">
        <LetterAvatar name={user.login} className="rounded-[8px]" />
        <div className="flex min-w-0 flex-col gap-1">
          <Link
            to="/admin/users/$userId"
            params={{ userId: user.id }}
            className="w-fit truncate outline-none transition-colors hover:text-primary focus-visible:text-primary"
          >
            {user.login}
          </Link>
          {user.telegram && (
            <span className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
              <img src={telegramUrl} alt="" className="size-3.5" />
              {user.telegram}
            </span>
          )}
        </div>
      </div>

      <div className="flex min-w-0 items-center gap-2">
        <IconTile tone="blue">
          <PersonCheckIcon />
        </IconTile>
        <TwoLines
          main={issuedBy.login}
          sub={userRoleMeta[issuedBy.role].label}
        />
      </div>

      <span>
        {formatNumber(debt.amount, "auto")}{" "}
        <span className="text-muted-foreground">USDT</span>
      </span>

      <div className="flex items-center gap-2.5 pr-6">
        <p
          title={debt.comment ?? undefined}
          className={cn(
            "line-clamp-2 max-w-[284px] leading-[1.2]",
            !debt.comment && "text-muted-foreground",
          )}
        >
          {debt.comment ?? "Комментарий не указан"}
        </p>
        <Button
          variant="secondary"
          aria-label="Изменить комментарий"
          className={squareButton}
          onClick={() => onOpen(debt, "comment")}
        >
          <EditIcon className="size-[15px]" />
        </Button>
      </div>

      <div className="flex items-center gap-2">
        {debt.autoDebitOn ? (
          <>
            <span className={cn(chip, "w-[107px] bg-green/10 text-green")}>
              Включено
            </span>
            <button
              type="button"
              title="Изменить дату"
              onClick={() => onOpen(debt, "autoDebit")}
              className={cn(
                chip,
                "w-[106px] bg-orange/10 text-orange outline-none transition-colors hover:bg-orange/20 focus-visible:ring-2 focus-visible:ring-ring",
              )}
            >
              {formatDate(debt.autoDebitOn)}
            </button>
            <Button
              variant="secondary"
              aria-label="Выключить автосписание"
              className={squareButton}
              disabled={stopAutoDebit.isPending}
              onClick={() => stopAutoDebit.mutate(undefined)}
            >
              <PauseIcon />
            </Button>
          </>
        ) : (
          <>
            <span
              className={cn(
                chip,
                "w-[107px] bg-foreground/10 text-foreground/60",
              )}
            >
              Выключено
            </span>
            <Button
              variant="secondary"
              aria-label="Включить автосписание"
              className={squareButton}
              onClick={() => onOpen(debt, "autoDebit")}
            >
              <PlayIcon />
            </Button>
          </>
        )}
      </div>

      <div className="flex items-center gap-2">
        <DebtLogPopover debtId={debt.id} />
        <Button
          className="h-[35px] gap-1 rounded-[12px] px-3"
          onClick={() => onOpen(debt, "writeOff")}
        >
          <ArrowDownIcon className="size-5" />
          Списать
        </Button>
      </div>
    </li>
  );
}
