import type { LinkProps } from "@tanstack/react-router";
import type { ComponentType } from "react";
import AddUserIcon from "@/assets/icons/add-user.svg?react";
import BuyoutsIcon from "@/assets/icons/buyouts.svg?react";
import CascadesIcon from "@/assets/icons/cascades.svg?react";
import DealsIcon from "@/assets/icons/deals.svg?react";
import FilterIcon from "@/assets/icons/filter.svg?react";
import InventoryIcon from "@/assets/icons/inventory.svg?react";
import MerchantsIcon from "@/assets/icons/merchants.svg?react";
import NotificationIcon from "@/assets/icons/notification.svg?react";
import SettingIcon from "@/assets/icons/setting.svg?react";
import StatisticsIcon from "@/assets/icons/statistics.svg?react";
import UsersIcon from "@/assets/icons/users.svg?react";

type Icon = ComponentType<{ className?: string }>;

export type NavLinkItem = {
  label: string;
  icon?: Icon;
  to: LinkProps["to"];
  exact?: boolean;
  badge?: number;
};

export type NavGroupItem = {
  label: string;
  icon?: Icon;
  children: NavLinkItem[];
};

export type NavSection = {
  title: string;
  items: (NavLinkItem | NavGroupItem)[];
};

export const navigation: NavSection[] = [
  {
    title: "Основное",
    items: [
      { label: "Инвентарь", icon: InventoryIcon, to: "/admin/inventory" },
      {
        label: "Статистика",
        icon: StatisticsIcon,
        children: [
          { label: "Обработка", to: "/admin/statistics/processing" },
          { label: "Мерчанты", to: "/admin/statistics/merchants" },
          { label: "Трейдеры", to: "/admin/statistics/traders" },
        ],
      },
      { label: "Сделки", icon: DealsIcon, to: "/admin/deals" },
      { label: "Откупы", icon: BuyoutsIcon, to: "/admin/buyouts" },
    ],
  },
  {
    title: "Управление",
    items: [
      {
        label: "Пользователи",
        icon: UsersIcon,
        children: [
          { label: "Список пользователей", to: "/admin/users", exact: true },
          { label: "Пополнения", to: "/admin/users/deposits" },
          { label: "Должники", to: "/admin/users/debtors" },
          { label: "Выводы", to: "/admin/users/withdrawals" },
          { label: "Сообщения", to: "/admin/users/messages" },
        ],
      },
      {
        label: "Мерчанты",
        icon: MerchantsIcon,
        children: [
          { label: "Список мерчантов", to: "/admin/merchants", exact: true },
          { label: "История мерчантов", to: "/admin/merchants/history" },
          { label: "Контрагенты", to: "/admin/merchants/counterparties" },
        ],
      },
      {
        label: "Каскады",
        icon: CascadesIcon,
        children: [
          { label: "Список каскадов", to: "/admin/cascades", exact: true },
          { label: "История запросов", to: "/admin/cascades/history" },
        ],
      },
      { label: "Инвайты", icon: AddUserIcon, to: "/admin/invites" },
    ],
  },
  {
    title: "Параметры",
    items: [
      {
        label: "Конфигурация",
        icon: FilterIcon,
        children: [
          { label: "Основные настройки", to: "/admin/config", exact: true },
          { label: "Банки", to: "/admin/config/banks" },
        ],
      },
      {
        label: "Оповещения",
        icon: NotificationIcon,
        to: "/admin/notifications",
        badge: 32,
      },
      { label: "Настройки", icon: SettingIcon, to: "/admin/settings" },
    ],
  },
];
