import type { ReactNode } from "react";
import EditIcon from "@/assets/icons/edit.svg?react";
import GroupIcon from "@/assets/icons/group.svg?react";
import MoreIcon from "@/assets/icons/more.svg?react";
import PercentIcon from "@/assets/icons/percent.svg?react";
import PlusIcon from "@/assets/icons/plus.svg?react";
import TrashIcon from "@/assets/icons/trash.svg?react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type MerchantAction =
  | "edit"
  | "rates"
  | "attach"
  | "removeFromGroup"
  | "joinGroup";
export type GroupAction = "rename" | "addMerchants";

const itemClass =
  "h-[34px] gap-1.5 rounded-[10px] px-2 text-[15px] leading-none font-semibold tracking-[-0.02em] [&_svg:not([class*='size-'])]:size-5";

function RowMenu({ label, children }: { label: string; children: ReactNode }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={label}
        className="grid size-[31px] place-items-center rounded-[8px] bg-[#101419]/50 outline-none transition-colors hover:bg-[#101419] focus-visible:ring-2 focus-visible:ring-ring data-popup-open:bg-[#101419]"
      >
        <MoreIcon className="size-5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="flex w-auto min-w-0 flex-col rounded-[17px] bg-[#15191d] p-2 shadow-drop ring-0"
      >
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function MerchantMenu({
  name,
  inGroup,
  onAction,
}: {
  name: string;
  inGroup: boolean;
  onAction: (action: MerchantAction) => void;
}) {
  return (
    <RowMenu label={`Действия: ${name}`}>
      <DropdownMenuItem className={itemClass} onClick={() => onAction("edit")}>
        <EditIcon />
        Редактировать мерчанта
      </DropdownMenuItem>
      <DropdownMenuItem className={itemClass} onClick={() => onAction("rates")}>
        <PercentIcon />
        Изменить ставку мерчанта
      </DropdownMenuItem>
      <DropdownMenuItem
        className={itemClass}
        onClick={() => onAction("attach")}
      >
        <GroupIcon />
        Прикрепить трейдеров / каскады
      </DropdownMenuItem>
      <DropdownMenuSeparator className="mx-2 my-2 bg-border/80" />
      {inGroup ? (
        <DropdownMenuItem
          variant="destructive"
          className={itemClass}
          onClick={() => onAction("removeFromGroup")}
        >
          <TrashIcon />
          Удалить из группы
        </DropdownMenuItem>
      ) : (
        <DropdownMenuItem
          className={itemClass}
          onClick={() => onAction("joinGroup")}
        >
          <PlusIcon />
          Добавить в группу
        </DropdownMenuItem>
      )}
    </RowMenu>
  );
}

export function GroupMenu({
  name,
  onAction,
}: {
  name: string;
  onAction: (action: GroupAction) => void;
}) {
  return (
    <RowMenu label={`Действия: ${name}`}>
      <DropdownMenuItem
        className={itemClass}
        onClick={() => onAction("rename")}
      >
        <EditIcon />
        Изменить название
      </DropdownMenuItem>
      <DropdownMenuItem
        className={itemClass}
        onClick={() => onAction("addMerchants")}
      >
        <PlusIcon />
        Добавить в группу
      </DropdownMenuItem>
    </RowMenu>
  );
}
