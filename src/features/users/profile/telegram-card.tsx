import { type ReactNode, useState } from "react";
import EditIcon from "@/assets/icons/edit.svg?react";
import { IconButton } from "@/components/icon-button";
import { Panel } from "@/components/panel";
import type { TelegramField } from "../schemas";
import type { UserProfile } from "../types";
import { TelegramDialog } from "./telegram-dialog";

export function TelegramCard({ user }: { user: UserProfile }) {
  const [field, setField] = useState<TelegramField | null>(null);
  const [open, setOpen] = useState(false);
  const [opening, setOpening] = useState(0);

  const edit = (next: TelegramField) => () => {
    setField(next);
    setOpening((n) => n + 1);
    setOpen(true);
  };

  return (
    <Panel className="flex flex-col p-7">
      <Row label="Telegram login" onEdit={edit("login")}>
        {user.telegram ? (
          <a
            href={`https://t.me/${user.telegram.replace(/^@/, "")}`}
            target="_blank"
            rel="noreferrer"
            className="truncate text-primary underline underline-offset-2 hover:text-primary-hover"
          >
            {user.telegram}
          </a>
        ) : (
          <Empty />
        )}
      </Row>
      <Row label="Telegram ID" onEdit={edit("id")}>
        {user.telegramId ?? <Empty />}
      </Row>
      <Row label="Telegram группы" onEdit={edit("groups")}>
        {user.telegramGroups.length > 0 ? (
          user.telegramGroups.join(" / ")
        ) : (
          <Empty />
        )}
      </Row>

      {field && (
        <TelegramDialog
          key={opening}
          field={field}
          user={user}
          open={open}
          onOpenChange={setOpen}
        />
      )}
    </Panel>
  );
}

function Row({
  label,
  onEdit,
  children,
}: {
  label: string;
  onEdit: () => void;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/80 py-[11px] text-[15px] leading-none font-medium tracking-[-0.02em] first:pt-0 last:border-b-0 last:pb-0">
      <span className="shrink-0">{label}</span>
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="truncate">{children}</span>
        <IconButton label={`Изменить: ${label}`} onClick={onEdit}>
          <EditIcon className="size-[15px]" />
        </IconButton>
      </div>
    </div>
  );
}

const Empty = () => <span className="text-muted-foreground">—</span>;
