import { Link } from "@tanstack/react-router";

const tabs = [
  { to: "/admin/users/$userId", label: "Настройки", exact: true },
  { to: "/admin/users/$userId/deals", label: "Сделки" },
  { to: "/admin/users/$userId/requisites", label: "Реквизиты" },
  { to: "/admin/users/$userId/logs", label: "Логи" },
  { to: "/admin/users/$userId/balance", label: "Баланс" },
  { to: "/admin/users/$userId/referral", label: "Реферальная программа" },
  { to: "/admin/users/$userId/verification", label: "Идентификация" },
] as const;

export function ProfileTabs({ userId }: { userId: string }) {
  return (
    <nav aria-label="Разделы пользователя" className="flex flex-wrap gap-3">
      {tabs.map((tab) => (
        <Link
          key={tab.to}
          to={tab.to}
          params={{ userId }}
          activeOptions={{
            exact: "exact" in tab && tab.exact,
            includeSearch: false,
          }}
          className="flex h-10 items-center rounded-[12px] bg-[#1b2127]/60 px-4 text-[15px] leading-none font-semibold tracking-[-0.02em] text-foreground/60 outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring data-[status=active]:bg-[#b456d4]/10 data-[status=active]:text-primary"
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
