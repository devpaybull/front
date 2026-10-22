import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { cn } from "cn";
import { useState } from "react";
import ExchangeIcon from "@/assets/icons/exchange.svg?react";
import LinkSlashIcon from "@/assets/icons/link-slash.svg?react";
import PlusIcon from "@/assets/icons/plus.svg?react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { IconCell, IconTile } from "@/components/icon-tile";
import { LetterAvatar } from "@/components/letter-avatar";
import { Panel } from "@/components/panel";
import { Button } from "@/components/ui/button";
import { BankLogo } from "@/features/deals/bank-logo";
import { useDialog } from "@/hooks/use-dialog";
import { formatDate } from "@/lib/dates";
import { unbindRequisite } from "./api";
import { BlockTitle } from "./counterparty-stats";
import { bindChannelLabels, bindTypeLabels, requisiteLine } from "./labels";
import {
  BindRequisiteDialog,
  ReplaceRequisiteDialog,
} from "./requisite-dialogs";
import type { BoundRequisite, CounterpartyDetails } from "./types";

const columns =
  "grid grid-cols-[306px_300px_266px_210px_minmax(0,1fr)_auto] items-center";

const chip =
  "flex h-[31px] w-fit items-center rounded-[10px] bg-[#1b2127]/60 px-3.5";

type Opened =
  | { action: "bind" }
  | { action: "replace" | "unbind"; binding: BoundRequisite };

export function BoundRequisites({
  counterparty: c,
}: {
  counterparty: CounterpartyDetails;
}) {
  const client = useQueryClient();
  const dialog = useDialog();
  const [opened, setOpened] = useState<Opened | null>(null);
  const open = (next: Opened) => {
    setOpened(next);
    dialog.show();
  };
  const dialogProps = {
    counterpartyId: c.id,
    open: dialog.open,
    onOpenChange: dialog.onOpenChange,
  };

  return (
    <Panel className="text-[15px] leading-none font-semibold tracking-[-0.02em]">
      <div className="flex items-start justify-between gap-6 border-b border-border/80 px-5 pt-[21px] pb-4">
        <BlockTitle
          title="Привязанные реквизиты"
          sub="Реквизиты трейдеров привязанные к контрагенту"
        />
        <Button
          variant="secondary"
          className="gap-[7px] rounded-[14px] px-6"
          onClick={() => open({ action: "bind" })}
        >
          <PlusIcon className="size-5" />
          Добавить реквизит
        </Button>
      </div>
      <div className={cn(columns, "h-[47px] border-b border-border/80 px-5")}>
        <span>Реквизит</span>
        <span>Трейдер</span>
        <span>Тип</span>
        <span>Канал</span>
        <span>Привязан</span>
      </div>
      {c.requisites.length === 0 ? (
        <p className="px-5 py-8 text-center text-muted-foreground">
          Реквизиты не привязаны
        </p>
      ) : (
        <ul>
          {c.requisites.map((r) => (
            <li
              key={r.bindingId}
              className={cn(
                columns,
                "border-b border-border/80 px-5 py-4 last:border-b-0",
              )}
            >
              <IconCell
                tile={
                  <IconTile tone="light">
                    <BankLogo bank={r.bank} />
                  </IconTile>
                }
                main={r.bank}
                sub={requisiteLine(r)}
              />
              <Link
                to="/admin/users/$userId"
                params={{ userId: r.trader.id }}
                className="flex w-fit min-w-0 items-center gap-2 outline-none transition-colors hover:text-primary focus-visible:text-primary"
              >
                <LetterAvatar name={r.trader.login} />
                <span className="truncate">{r.trader.login}</span>
              </Link>
              <span className={chip}>{bindTypeLabels[r.bindType]}</span>
              <span className={chip}>{bindChannelLabels[r.channel]}</span>
              <span>{formatDate(r.boundAt)}</span>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => open({ action: "replace", binding: r })}
                  className="flex h-[31px] items-center gap-1.5 rounded-[8px] border border-border bg-[#1b2127]/60 px-2 outline-none transition-colors hover:bg-[#1b2127] focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <ExchangeIcon className="size-5" />
                  Заменить
                </button>
                <button
                  type="button"
                  onClick={() => open({ action: "unbind", binding: r })}
                  className="flex h-[31px] items-center gap-[7px] rounded-[8px] border border-destructive/25 bg-destructive/10 px-2 text-destructive outline-none transition-colors hover:bg-destructive/20 focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <LinkSlashIcon className="size-5" />
                  Отвязать
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {dialog.mounted &&
        opened &&
        (opened.action === "bind" ? (
          <BindRequisiteDialog
            key={dialog.key}
            {...dialogProps}
            boundIds={c.requisites.map((r) => r.id)}
          />
        ) : opened.action === "replace" ? (
          <ReplaceRequisiteDialog
            key={dialog.key}
            {...dialogProps}
            binding={opened.binding}
          />
        ) : (
          <ConfirmDialog
            key={dialog.key}
            open={dialog.open}
            onOpenChange={dialog.onOpenChange}
            title="Отвязать реквизит"
            icon={<LinkSlashIcon />}
            confirmLabel="Отвязать"
            destructive
            onConfirm={async () => {
              await unbindRequisite(c.id, opened.binding.bindingId);
              await client.invalidateQueries({ queryKey: ["counterparties"] });
            }}
          >
            Реквизит {opened.binding.bank} ({opened.binding.value}) трейдера{" "}
            {opened.binding.trader.login} больше не будет предлагаться этому
            контрагенту.
          </ConfirmDialog>
        ))}
    </Panel>
  );
}
