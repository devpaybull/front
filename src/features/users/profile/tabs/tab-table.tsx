import { cn } from "cn";
import type { ReactNode } from "react";
import { Panel } from "@/components/panel";
import { TableMessage } from "@/components/table/table-message";

export function TabTable({
  columns,
  header,
  minWidth = 1560,
  state,
  emptyText,
  children,
}: {
  columns: string;
  header: ReactNode;
  minWidth?: number;
  state: "pending" | "error" | "empty" | "ready";
  emptyText: string;
  children: ReactNode;
}) {
  return (
    <Panel className="overflow-x-auto">
      <div style={{ minWidth }}>
        <div
          className={cn(
            columns,
            "h-14 items-center border-b border-border/80 px-7 text-[15px] leading-none font-semibold tracking-[-0.02em]",
          )}
        >
          {header}
        </div>
        {state === "ready" ? (
          <ul>{children}</ul>
        ) : (
          <TableMessage>
            {state === "pending"
              ? "Загрузка…"
              : state === "error"
                ? "Не удалось загрузить"
                : emptyText}
          </TableMessage>
        )}
      </div>
    </Panel>
  );
}

export function TabRow({
  columns,
  children,
}: {
  columns: string;
  children: ReactNode;
}) {
  return (
    <li
      className={cn(
        columns,
        "min-h-[66px] items-center border-b border-border/80 px-7 py-4 text-[15px] leading-none font-semibold tracking-[-0.02em] last:border-b-0",
      )}
    >
      {children}
    </li>
  );
}

export const tableState = (query: {
  isPending: boolean;
  isError: boolean;
  data?: unknown[];
}) =>
  query.isPending
    ? "pending"
    : query.isError
      ? "error"
      : query.data?.length
        ? "ready"
        : "empty";
