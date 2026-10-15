import CloseIcon from "@/assets/icons/close.svg?react";
import ExtendIcon from "@/assets/icons/extend.svg?react";
import MoreIcon from "@/assets/icons/more.svg?react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Invite } from "./types";

export type InviteAction = "extend" | "stop";

const itemClass =
  "gap-1.5 rounded-lg p-2 text-[15px] leading-none font-semibold tracking-[-0.02em]";

type InviteActionsProps = {
  invite: Invite;
  onAction: (action: InviteAction, invite: Invite) => void;
};

export function InviteActions({ invite, onAction }: InviteActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Действия с кодом ${invite.code}`}
        className="grid size-[31px] place-items-center rounded-lg bg-[#1b2127]/60 text-foreground/60 outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring data-popup-open:bg-primary/15 data-popup-open:text-primary"
      >
        <MoreIcon className="size-5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={6}
        className="w-auto min-w-0 rounded-[17px] bg-[#15191d] p-2 shadow-[0_4px_16px_rgb(0_0_0/0.25)] ring-0"
      >
        <DropdownMenuItem
          disabled={invite.status === "used"}
          onClick={() => onAction("extend", invite)}
          className={itemClass}
        >
          <ExtendIcon className="size-5" />
          Продлить срок
        </DropdownMenuItem>
        <DropdownMenuSeparator className="mx-2 my-1 bg-border/80" />
        <DropdownMenuItem
          variant="destructive"
          disabled={invite.status !== "active"}
          onClick={() => onAction("stop", invite)}
          className={itemClass}
        >
          <CloseIcon className="size-5" />
          Остановить досрочно
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
