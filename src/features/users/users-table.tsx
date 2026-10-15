import { useQuery } from "@tanstack/react-query";
import { cn } from "cn";
import { AnimatePresence } from "motion/react";
import { useDeferredValue, useMemo } from "react";
import { type CountTab, CountTabs } from "@/components/count-tabs";
import { HighlightContext } from "@/components/table/highlighted";
import { SortHeader } from "@/components/table/sort-header";
import { TableMessage } from "@/components/table/table-message";
import { Button } from "@/components/ui/button";
import { useStableList } from "@/hooks/use-stable-list";
import { usersQuery } from "./api";
import {
  CompactUserRow,
  compactColumns,
  compactTables,
} from "./compact-user-row";
import type { UserSortField, UsersSearch } from "./schemas";
import type { User, UserRole } from "./types";
import { userRoleGroups, userRoleMeta } from "./user-role";
import { UserRow, userColumns } from "./user-row";

const EMPTY: User[] = [];

const roleTabs = (
  counts?: Record<UserRole | "all", number>,
): CountTab<UserRole>[] => [
  { value: undefined, label: "Все", count: counts?.all },
  ...userRoleGroups.flatMap((group) =>
    group.map((role, index) => ({
      value: role,
      label: userRoleMeta[role].label,
      count: counts?.[role],
      tone: userRoleMeta[role].tone,
      separatorBefore: index === 0,
    })),
  ),
];

const searchable = (user: User) => [
  user.login,
  user.telegram ?? "",
  user.token,
  user.cascade?.name ?? "",
  user.merchant?.name ?? "",
];

type UsersTableProps = {
  search: UsersSearch;
  liveQuery: string;
  onChange: (patch: Partial<UsersSearch>) => void;
};

export function UsersTable({ search, liveQuery, onChange }: UsersTableProps) {
  const { data, isPending, isError, isPlaceholderData, refetch } = useQuery(
    usersQuery(search),
  );
  const compact = search.role && compactTables[search.role];

  const live = useDeferredValue(liveQuery.toLowerCase());
  const loaded = useStableList(data?.items ?? EMPTY);
  const items = useMemo(
    () =>
      loaded.filter(
        (user) =>
          (!search.role || user.role === search.role) &&
          searchable(user).some((value) => value.toLowerCase().includes(live)),
      ),
    [loaded, live, search.role],
  );

  const sortHeader = (field: UserSortField, label: string) => (
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

  return (
    <section className="rounded-2xl border border-border/80 bg-panel">
      <div className="px-[14px] pt-[14px]">
        <CountTabs
          label="Роль"
          tabs={roleTabs(data?.counts)}
          value={search.role}
          onChange={(role) => onChange({ role })}
          countOnHover
        />
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[1615px]">
          <div
            className={cn(
              compact ? compactColumns : userColumns,
              "items-center border-b border-border/80 px-[27px] pt-[30px] pb-[15px] text-[15px] leading-none font-semibold tracking-[-0.02em]",
            )}
          >
            {compact ? (
              <>
                {sortHeader("login", "Логин")}
                {compact.linked &&
                  sortHeader(compact.linked.sort, compact.linked.title)}
              </>
            ) : (
              <>
                {sortHeader("login", "Логин")}
                {sortHeader("balance", "Баланс")}
                {sortHeader("deposit", "Мин. страховой депозит")}
                <span>
                  {search.role === "lead_trader"
                    ? "Зависимости (подчиненные)"
                    : "Зависимости (тим-лиды)"}
                </span>
                {sortHeader("rate", "Ставка")}
                <span>Статус</span>
                {sortHeader("registeredAt", "Дата регистрации")}
              </>
            )}
          </div>

          {isPending ? (
            <TableMessage>Загрузка…</TableMessage>
          ) : isError ? (
            <TableMessage>
              Не удалось загрузить пользователей
              <Button variant="secondary" onClick={() => refetch()}>
                Повторить
              </Button>
            </TableMessage>
          ) : (
            <>
              <HighlightContext value={live}>
                <ul key={compact ? search.role : "users"} className="relative">
                  <AnimatePresence mode="popLayout">
                    {items.map((user) =>
                      compact ? (
                        <CompactUserRow
                          key={user.id}
                          user={user}
                          linked={compact.linked}
                        />
                      ) : (
                        <UserRow key={user.id} user={user} />
                      ),
                    )}
                  </AnimatePresence>
                </ul>
              </HighlightContext>
              {items.length === 0 && !isPlaceholderData && (
                <TableMessage>
                  {live ? "Ничего не найдено" : "Пользователей пока нет"}
                </TableMessage>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
