import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import ArrowDownIcon from "@/assets/icons/arrow-down.svg?react";
import ArrowUpIcon from "@/assets/icons/arrow-up.svg?react";
import DealsIcon from "@/assets/icons/deals.svg?react";
import InventoryIcon from "@/assets/icons/inventory.svg?react";
import MinusCircleIcon from "@/assets/icons/minus-circle.svg?react";
import PhoneIcon from "@/assets/icons/phone-solid.svg?react";
import telegramUrl from "@/assets/icons/telegram-blue.svg";
import ToggleIcon from "@/assets/icons/toggle.svg?react";
import UserIcon from "@/assets/icons/user.svg?react";
import { IconCell, IconTile, type IconTileTone } from "@/components/icon-tile";
import { TwoLines } from "@/components/table/two-lines";
import { formatDate, formatTime } from "@/lib/dates";
import { userLogsQuery } from "../../api";
import type { LogEvent } from "../../types";
import { TabRow, TabTable, tableState } from "./tab-table";

const columns = "grid grid-cols-[948px_minmax(0,1fr)]";

const telegram = <img src={telegramUrl} alt="" className="size-5" />;

const events: Record<
  LogEvent,
  { label: string; tone: IconTileTone; icon: ReactNode }
> = {
  tradingOn: {
    label: "Торговля включена",
    tone: "green",
    icon: <ToggleIcon />,
  },
  tradingOff: {
    label: "Торговля выключена",
    tone: "orange",
    icon: <ToggleIcon />,
  },
  requisiteAdded: {
    label: "Добавлен новый реквизит",
    tone: "green",
    icon: <InventoryIcon />,
  },
  requisiteRemoved: {
    label: "Удален реквизит",
    tone: "orange",
    icon: <InventoryIcon />,
  },
  counterpartyLinked: {
    label: "Привязка контрагента",
    tone: "green",
    icon: <UserIcon />,
  },
  counterpartyUnlinked: {
    label: "Отвязка контрагента",
    tone: "orange",
    icon: <UserIcon />,
  },
  deviceAdded: {
    label: "Добавлено новое устройство",
    tone: "green",
    icon: <PhoneIcon />,
  },
  deviceRemoved: {
    label: "Устройство удалено",
    tone: "orange",
    icon: <PhoneIcon />,
  },
  telegramLinked: {
    label: "Привязка telegram бота",
    tone: "blue",
    icon: telegram,
  },
  telegramUnlinked: {
    label: "Telegram бот отвязан",
    tone: "blue",
    icon: telegram,
  },
  tokenBalanceEmpty: {
    label: "Закончился баланс на токене",
    tone: "orange",
    icon: <MinusCircleIcon />,
  },
  balanceDeposit: {
    label: "Пополнение баланса",
    tone: "green",
    icon: <ArrowDownIcon />,
  },
  balanceWithdrawal: {
    label: "Вывод с баланса",
    tone: "orange",
    icon: <ArrowUpIcon />,
  },
  autoBuyoutOn: {
    label: "Включение автооткупа",
    tone: "green",
    icon: <DealsIcon />,
  },
  autoBuyoutOff: {
    label: "Выключение автооткупа",
    tone: "orange",
    icon: <DealsIcon />,
  },
};

export function LogsTab({ userId }: { userId: string }) {
  const query = useQuery(userLogsQuery(userId));

  return (
    <TabTable
      columns={columns}
      state={tableState(query)}
      emptyText="Событий пока не было"
      header={
        <>
          <span>Действие</span>
          <span>Дата</span>
        </>
      }
    >
      {query.data?.map((log) => {
        const event = events[log.event];
        return (
          <TabRow key={log.id} columns={columns}>
            <IconCell
              tile={<IconTile tone={event.tone}>{event.icon}</IconTile>}
              main={
                <>
                  {event.label}
                  {log.details && (
                    <span className="text-blue"> ({log.details})</span>
                  )}
                </>
              }
              sub={log.reason ?? undefined}
            />
            <TwoLines
              main={formatDate(log.createdAt)}
              sub={formatTime(log.createdAt, true)}
            />
          </TabRow>
        );
      })}
    </TabTable>
  );
}
