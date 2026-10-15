import { useQuery } from "@tanstack/react-query";
import { cn } from "cn";
import { AnimatePresence, motion } from "motion/react";
import {
  memo,
  type Ref,
  useCallback,
  useContext,
  useDeferredValue,
  useMemo,
  useState,
} from "react";
import ChevronDownIcon from "@/assets/icons/chevron-down.svg?react";
import { type CountTab, CountTabs } from "@/components/count-tabs";
import { HighlightContext, Highlighted } from "@/components/table/highlighted";
import { SortHeader } from "@/components/table/sort-header";
import { TableMessage } from "@/components/table/table-message";
import { TwoLines } from "@/components/table/two-lines";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { useStableList } from "@/hooks/use-stable-list";
import { formatDate, formatTimeLeft } from "@/lib/dates";
import { formatAmount, formatRate } from "@/lib/format";
import { listItemMotion } from "@/lib/motion";
import { invitesQuery } from "./api";
import { ExtendInviteDialog } from "./extend-invite-dialog";
import { type InviteAction, InviteActions } from "./invite-actions";
import { InviteStatusBadge, inviteStatusMeta } from "./invite-status";
import type { InviteSortField, InvitesSearch } from "./schemas";
import { StopInviteDialog } from "./stop-invite-dialog";
import type { Invite, InviteStatus } from "./types";

const columns =
  "grid grid-cols-[267px_296px_188px_252px_203px_163px_minmax(0,1fr)_31px] items-center";

const statuses: InviteStatus[] = ["active", "used", "expired"];

const EMPTY: Invite[] = [];

type InvitesTableProps = {
  search: InvitesSearch;
  liveQuery: string;
  onChange: (patch: Partial<InvitesSearch>) => void;
};

export function InvitesTable({
  search,
  liveQuery,
  onChange,
}: InvitesTableProps) {
  const { data, isPending, isError, refetch } = useQuery(invitesQuery(search));

  const live = useDeferredValue(liveQuery.toUpperCase());
  const loaded = useStableList(data?.items ?? EMPTY);
  const items = useMemo(
    () => loaded.filter((invite) => invite.code.includes(live)),
    [loaded, live],
  );

  const [target, setTarget] = useState<{
    action: InviteAction;
    invite: Invite;
  } | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const openAction = useCallback((action: InviteAction, invite: Invite) => {
    setTarget({ action, invite });
    setDialogOpen(true);
  }, []);

  const tabs: CountTab<InviteStatus>[] = [
    { value: undefined, label: "Все", count: data?.counts.all },
    ...statuses.map((status) => ({
      value: status,
      label: inviteStatusMeta[status].tab,
      count: data?.counts[status],
      dot: inviteStatusMeta[status].dot,
    })),
  ];

  const sortBy = (field: InviteSortField) =>
    onChange(
      search.sort === field
        ? { order: search.order === "asc" ? "desc" : "asc" }
        : { sort: field, order: "asc" },
    );

  const sortHeader = (field: InviteSortField, label: string) => (
    <SortHeader
      label={label}
      active={search.sort === field}
      ascending={search.order === "asc"}
      onClick={() => sortBy(field)}
    />
  );

  return (
    <section className="rounded-2xl border border-border/80 bg-panel">
      <div className="px-[14px] pt-[14px]">
        <CountTabs
          label="Статус кода"
          tabs={tabs}
          value={search.status}
          onChange={(status) => onChange({ status })}
        />
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[1615px]">
          <div
            className={cn(
              columns,
              "border-b border-border/80 px-[25px] pt-[34px] pb-[15px] text-[15px] leading-none font-semibold tracking-[-0.02em]",
            )}
          >
            {sortHeader("code", "Код")}
            <span>Статус</span>
            {sortHeader("rate", "Ставка")}
            {sortHeader("deposit", "Мин. страховой депозит")}
            {sortHeader("validUntil", "Действителен до")}
            <span>Telegram</span>
            <span>Создатель</span>
            <span className="sr-only">Действия</span>
          </div>

          {isPending ? (
            <TableMessage>Загрузка…</TableMessage>
          ) : isError ? (
            <TableMessage>
              Не удалось загрузить коды
              <Button variant="secondary" onClick={() => refetch()}>
                Повторить
              </Button>
            </TableMessage>
          ) : (
            <>
              <HighlightContext value={live}>
                <ul className="relative">
                  <AnimatePresence mode="popLayout">
                    {items.map((invite) => (
                      <InviteRow
                        key={invite.id}
                        invite={invite}
                        onAction={openAction}
                      />
                    ))}
                  </AnimatePresence>
                </ul>
              </HighlightContext>
              {items.length === 0 && (
                <TableMessage>
                  {live ? "Ничего не найдено" : "Кодов пока нет"}
                </TableMessage>
              )}
            </>
          )}
        </div>
      </div>

      {target?.action === "extend" && (
        <ExtendInviteDialog
          key={target.invite.id}
          invite={target.invite}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
        />
      )}
      {target?.action === "stop" && (
        <StopInviteDialog
          key={target.invite.id}
          invite={target.invite}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
        />
      )}
    </section>
  );
}

type InviteRowProps = {
  invite: Invite;
  onAction: (action: InviteAction, invite: Invite) => void;
  ref?: Ref<HTMLLIElement>;
};

const InviteRow = memo(function InviteRow({
  invite,
  onAction,
  ref,
}: InviteRowProps) {
  const { rate, minInsuranceDeposit: deposit } = invite;

  return (
    <motion.li
      ref={ref}
      {...listItemMotion}
      className="border-b border-border/80 py-1.5 last:border-b-0"
    >
      <div
        className={cn(
          columns,
          "mx-1.5 min-h-[69px] rounded-[17px] px-[19px] py-2.5 text-[15px] leading-none font-semibold tracking-[-0.02em] transition-colors hover:bg-[#1b2127]/60",
        )}
      >
        <div>
          <CodeChip code={invite.code} />
        </div>

        <div className="flex flex-col gap-[5px]">
          <InviteStatusBadge status={invite.status} />
          {invite.usedBy && (
            <span className="text-[13px] text-muted-foreground">
              {invite.usedBy.email} / {formatDate(invite.usedBy.at)}
            </span>
          )}
        </div>

        <TwoLines
          sub="RUB"
          main={
            <span className="flex items-center gap-1">
              {formatRate(rate)}
              <ChevronDownIcon className="size-4 text-foreground/60" />
            </span>
          }
        />

        <TwoLines
          sub="USDT"
          main={`In ${formatAmount(deposit.payIn, "USDT")} / Out ${formatAmount(deposit.payOut, "USDT")}`}
        />

        <TwoLines
          main={formatDate(invite.validUntil)}
          sub={
            invite.status === "expired"
              ? "истёк"
              : formatTimeLeft(invite.validUntil)
          }
        />

        <span className="truncate text-muted-foreground">
          {invite.telegram}
        </span>
        <span className="truncate text-muted-foreground">{invite.creator}</span>

        <InviteActions invite={invite} onAction={onAction} />
      </div>
    </motion.li>
  );
});

function CodeChip({ code }: { code: string }) {
  const [copied, copy] = useCopyToClipboard();
  const highlight = useContext(HighlightContext);

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            type="button"
            onClick={() => copy(code)}
            className="rounded-[10px] bg-[#1b2127]/60 px-3.5 py-2 text-[15px] leading-none font-semibold tracking-[-0.02em] outline-none transition-colors hover:bg-primary/10 hover:text-primary focus-visible:ring-2 focus-visible:ring-ring"
          />
        }
      >
        <Highlighted text={code} part={highlight} />
      </TooltipTrigger>
      <TooltipContent>
        {copied ? "Скопировано" : "Копировать код"}
      </TooltipContent>
    </Tooltip>
  );
}
