import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { cn } from "cn";
import { type ReactNode, useState } from "react";
import ChevronIcon from "@/assets/icons/chevron-down-20.svg?react";
import LayerGroupIcon from "@/assets/icons/layer-group.svg?react";
import MerchantsIcon from "@/assets/icons/merchants.svg?react";
import TrashIcon from "@/assets/icons/trash.svg?react";
import Users3Icon from "@/assets/icons/users-3.svg?react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { IconTile } from "@/components/icon-tile";
import { SortHeader } from "@/components/table/sort-header";
import { TableMessage } from "@/components/table/table-message";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { RatesDialog } from "@/features/users/profile/rates/rates-dialog";
import { useDialog } from "@/hooks/use-dialog";
import { formatAmount, tailId } from "@/lib/format";
import {
  merchantsQuery,
  removeFromMerchantGroup,
  updateMerchant,
  updateMerchantGroup,
} from "./api";
import { AttachDialog } from "./attach-dialog";
import { AttachmentsPanel } from "./attachments-panel";
import {
  AddMerchantsDialog,
  JoinGroupDialog,
  RenameGroupDialog,
} from "./group-dialogs";
import {
  type GroupAction,
  GroupMenu,
  type MerchantAction,
  MerchantMenu,
} from "./merchant-menu";
import { MethodsCell } from "./method-chips";
import type { MerchantSortField, MerchantsSearch } from "./schemas";
import type { Merchant, MerchantGroup } from "./types";
import {
  mapGroup,
  mapMerchant,
  useMerchantsMutation,
} from "./use-merchants-mutation";

const columns =
  "grid grid-cols-[152px_255px_166px_113px_138px_387px_231px_minmax(78px,1fr)_31px] items-center";

type Opened =
  | { action: "rename" | "addMerchants"; group: MerchantGroup }
  | { action: Exclude<MerchantAction, "edit">; merchant: Merchant };

type Switches = { enabled?: boolean; exclusive?: boolean };

type MerchantsTableProps = {
  search: MerchantsSearch;
  onChange: (patch: Partial<MerchantsSearch>) => void;
};

export function MerchantsTable({ search, onChange }: MerchantsTableProps) {
  const { data, isPending, isError, refetch } = useQuery(
    merchantsQuery(search),
  );
  const navigate = useNavigate();
  const [toggledGroups, setToggledGroups] = useState<Set<string>>(new Set());
  const [openAttachments, setOpenAttachments] = useState<Set<string>>(
    new Set(),
  );
  const flip = (set: Set<string>, id: string) => {
    const next = new Set(set);
    if (!next.delete(id)) next.add(id);
    return next;
  };

  const dialog = useDialog();
  const [opened, setOpened] = useState<Opened | null>(null);
  const open = (next: Opened) => {
    setOpened(next);
    dialog.show();
  };

  const switchMerchant = useMerchantsMutation(
    ({ id, patch }: { id: string; patch: Switches }) =>
      updateMerchant(id, patch),
    (list, { id, patch }) => mapMerchant(list, id, (m) => ({ ...m, ...patch })),
  );
  const switchGroup = useMerchantsMutation(
    ({ id, patch }: { id: string; patch: Switches }) =>
      updateMerchantGroup(id, patch),
    (list, { id, patch }) =>
      mapGroup(list, id, (g) => ({
        ...g,
        ...patch,
        merchants: g.merchants.map((m) => ({ ...m, ...patch })),
      })),
  );
  const removeFromGroup = useMerchantsMutation(
    (m: Merchant) => removeFromMerchantGroup(m.groupId ?? "", m.id),
    (list) => list,
  );

  const onMerchantAction = (merchant: Merchant, action: MerchantAction) =>
    action === "edit"
      ? navigate({
          to: "/admin/users/$userId",
          params: { userId: merchant.userId },
        })
      : open({ action, merchant });
  const onGroupAction = (group: MerchantGroup, action: GroupAction) =>
    open({ action, group });

  const sortHeader = (field: MerchantSortField, label: string) => (
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

  const merchantRow = (merchant: Merchant, inGroup: boolean) => (
    <MerchantRow
      key={merchant.id}
      merchant={merchant}
      inGroup={inGroup}
      attachmentsOpen={openAttachments.has(merchant.id)}
      onToggleAttachments={() =>
        setOpenAttachments((set) => flip(set, merchant.id))
      }
      onSwitch={(patch) => switchMerchant.mutate({ id: merchant.id, patch })}
      onAction={(action) => onMerchantAction(merchant, action)}
    />
  );

  return (
    <section className="rounded-2xl border border-border/80 bg-panel">
      <div className="overflow-x-auto">
        <div className="min-w-[1615px] text-[15px] leading-none font-semibold tracking-[-0.02em]">
          <div
            className={cn(columns, "h-[60px] border-b border-border/80 px-7")}
          >
            {sortHeader("id", "ID")}
            <span>Группа / Мерчант</span>
            {sortHeader("balance", "Баланс")}
            <span>Статус</span>
            <span>Искл. залив</span>
            <span>Вход</span>
            <span>Выход</span>
          </div>

          {isPending ? (
            <TableMessage>Загрузка…</TableMessage>
          ) : isError ? (
            <TableMessage>
              Не удалось загрузить мерчантов
              <Button variant="secondary" onClick={() => refetch()}>
                Повторить
              </Button>
            </TableMessage>
          ) : data.items.length === 0 ? (
            <TableMessage>
              {search.q || search.status || search.exclusive
                ? "Ничего не найдено"
                : "Мерчантов пока нет"}
            </TableMessage>
          ) : (
            <ul>
              {data.items.map((item) =>
                item.kind === "merchant" ? (
                  <li
                    key={item.id}
                    className="border-b border-border/80 last:border-b-0"
                  >
                    {merchantRow(item, false)}
                  </li>
                ) : (
                  <GroupItem
                    key={item.id}
                    group={item}
                    open={toggledGroups.has(item.id) !== !!search.q}
                    onToggle={() =>
                      setToggledGroups((set) => flip(set, item.id))
                    }
                    onSwitch={(patch) =>
                      switchGroup.mutate({ id: item.id, patch })
                    }
                    onAction={(action) => onGroupAction(item, action)}
                  >
                    {item.merchants.map((m) => merchantRow(m, true))}
                  </GroupItem>
                ),
              )}
            </ul>
          )}
        </div>
      </div>

      {dialog.mounted && opened && (
        <OpenedDialog
          key={dialog.key}
          opened={opened}
          open={dialog.open}
          onOpenChange={dialog.onOpenChange}
          onRemove={(m) => removeFromGroup.mutateAsync(m)}
        />
      )}
    </section>
  );
}

function OpenedDialog({
  opened,
  open,
  onOpenChange,
  onRemove,
}: {
  opened: Opened;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRemove: (merchant: Merchant) => Promise<unknown>;
}) {
  const props = { open, onOpenChange };
  if ("group" in opened) {
    const { group } = opened;
    return opened.action === "rename" ? (
      <RenameGroupDialog {...props} group={group} />
    ) : (
      <AddMerchantsDialog {...props} group={group} />
    );
  }
  const { merchant } = opened;
  switch (opened.action) {
    case "rates":
      return <RatesDialog {...props} userId={merchant.userId} />;
    case "attach":
      return <AttachDialog {...props} merchant={merchant} />;
    case "joinGroup":
      return <JoinGroupDialog {...props} merchant={merchant} />;
    case "removeFromGroup":
      return (
        <ConfirmDialog
          {...props}
          title="Удалить из группы"
          icon={<TrashIcon />}
          confirmLabel="Удалить"
          destructive
          onConfirm={() => onRemove(merchant)}
        >
          Мерчант «{merchant.name}» станет работать сам по себе. Вернуть его
          можно через «Добавить в группу».
        </ConfirmDialog>
      );
  }
}

function IdChip({ id, className }: { id: string; className?: string }) {
  return (
    <span
      title={id}
      className={cn(
        "flex h-[31px] w-fit max-w-[122px] items-center rounded-[10px] bg-[#101419]/50 px-3.5",
        className,
      )}
    >
      <span className="truncate">{tailId(id)}</span>
    </span>
  );
}

const switchesOf = (
  item: Pick<Merchant, "enabled" | "exclusive" | "name">,
  onSwitch: (patch: Switches) => void,
) => (
  <>
    <Switch
      size="sm"
      aria-label={`Статус: ${item.name}`}
      checked={item.enabled}
      onCheckedChange={(enabled) => onSwitch({ enabled })}
    />
    <Switch
      size="sm"
      aria-label={`Искл. залив: ${item.name}`}
      checked={item.exclusive}
      onCheckedChange={(exclusive) => onSwitch({ exclusive })}
    />
  </>
);

const balanceOf = (balance: string) => `${formatAmount(balance, "USDT")} USDT`;

function MerchantRow({
  merchant: m,
  inGroup,
  attachmentsOpen,
  onToggleAttachments,
  onSwitch,
  onAction,
}: {
  merchant: Merchant;
  inGroup: boolean;
  attachmentsOpen: boolean;
  onToggleAttachments: () => void;
  onSwitch: (patch: Switches) => void;
  onAction: (action: MerchantAction) => void;
}) {
  const attached = m.traders.length + m.cascades.length;
  return (
    <div className={cn("py-[15px]", inGroup ? "px-4" : "px-7")}>
      <div className={columns}>
        <IdChip id={m.id} />
        <Link
          to="/admin/users/$userId"
          params={{ userId: m.userId }}
          className="flex w-fit min-w-0 items-center gap-2 outline-none transition-colors hover:text-blue focus-visible:text-blue"
        >
          <IconTile tone="orange">
            <MerchantsIcon />
          </IconTile>
          <span className="truncate">{m.name}</span>
        </Link>
        <span>{balanceOf(m.balance)}</span>
        {switchesOf(m, onSwitch)}
        <MethodsCell title="Вход" methods={m.payIn} className="w-[350px]" />
        <MethodsCell title="Выход" methods={m.payOut} className="w-[178px]" />
        {attached > 0 ? (
          <button
            type="button"
            aria-expanded={attachmentsOpen}
            aria-label={`Прикрепленные трейдеры и каскады: ${attached}`}
            onClick={onToggleAttachments}
            className={cn(
              "flex h-[37px] w-[78px] items-center gap-1.5 rounded-[12px] pr-2 pl-2 text-[13px] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
              attachmentsOpen
                ? "bg-[#3e454d]/50"
                : "bg-[#101419]/50 hover:bg-[#101419]",
            )}
          >
            <Users3Icon className="size-5 shrink-0" />
            {attached}
            <ChevronIcon
              className={cn(
                "ml-auto size-5 shrink-0 text-foreground/60 transition-transform",
                attachmentsOpen && "rotate-180",
              )}
            />
          </button>
        ) : (
          <span />
        )}
        <MerchantMenu name={m.name} inGroup={inGroup} onAction={onAction} />
      </div>
      {attachmentsOpen && attached > 0 && <AttachmentsPanel merchant={m} />}
    </div>
  );
}

function GroupItem({
  group: g,
  open,
  onToggle,
  onSwitch,
  onAction,
  children,
}: {
  group: MerchantGroup;
  open: boolean;
  onToggle: () => void;
  onSwitch: (patch: Switches) => void;
  onAction: (action: GroupAction) => void;
  children: ReactNode;
}) {
  return (
    <li className="relative border-b border-border/80 last:border-b-0">
      {open && (
        <span
          aria-hidden
          className="absolute top-1 bottom-4 left-3 w-1 rounded-full bg-blue"
        />
      )}
      <div className={cn(columns, "px-7 py-[15px]")}>
        <IdChip id={g.id} className="bg-[#1b2127]/60" />
        <button
          type="button"
          aria-expanded={open}
          onClick={onToggle}
          className={cn(
            "flex w-fit min-w-0 items-center gap-2.5 outline-none transition-colors hover:text-blue focus-visible:text-blue",
            open && "text-primary",
          )}
        >
          <span className="flex min-w-0 items-center gap-2">
            <IconTile tone="primary">
              <LayerGroupIcon />
            </IconTile>
            <span className="truncate">{g.name}</span>
          </span>
          <ChevronIcon
            className={cn(
              "size-5 shrink-0 text-foreground/60 transition-transform",
              open && "rotate-180",
            )}
          />
        </button>
        <span>{balanceOf(g.balance)}</span>
        {switchesOf(g, onSwitch)}
        <MethodsCell title="Вход" methods={g.payIn} className="w-[350px]" />
        <MethodsCell title="Выход" methods={g.payOut} className="w-[178px]" />
        <span />
        <GroupMenu name={g.name} onAction={onAction} />
      </div>
      {open && (
        <div className="mx-3 mb-4 rounded-[2px] bg-[#1c2125] [&>div:not(:last-child)]:border-b [&>div:not(:last-child)]:border-border/80">
          {children}
        </div>
      )}
    </li>
  );
}
