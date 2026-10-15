import { Link } from "@tanstack/react-router";
import { cn } from "cn";
import {
  type ComponentProps,
  type ComponentType,
  memo,
  useContext,
} from "react";
import { HighlightContext, Highlighted } from "@/components/table/highlighted";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { UserSortField } from "./schemas";
import type { EntityRef, User, UserRole } from "./types";
import { LoginCell, type UserRowProps, UserRowShell } from "./user-row";

export const compactColumns =
  "grid grid-cols-[806px_minmax(0,1fr)] items-center";

type EntityLinkProps = Omit<ComponentProps<"a">, "href"> & { id: string };

export type LinkedColumn = {
  title: string;
  sort: UserSortField;
  tooltip: string;
  entity: (user: User) => EntityRef | null;
  EntityLink: ComponentType<EntityLinkProps>;
};

export type CompactTable = {
  searchHint: string;
  linked?: LinkedColumn;
};

const cascadeColumn: LinkedColumn = {
  title: "Каскад",
  sort: "cascade",
  tooltip: "Открыть каскад",
  entity: (user) => user.cascade,
  EntityLink: ({ id, ...props }) => (
    <Link
      to="/admin/cascades/$cascadeId"
      params={{ cascadeId: id }}
      {...props}
    />
  ),
};

const merchantColumn: LinkedColumn = {
  title: "Мерчант",
  sort: "merchant",
  tooltip: "Открыть мерчанта",
  entity: (user) => user.merchant,
  EntityLink: ({ id, ...props }) => (
    <Link
      to="/admin/merchants/$merchantId"
      params={{ merchantId: id }}
      {...props}
    />
  ),
};

const merchantTable: CompactTable = {
  searchHint: "Поиск по логину/telegram или мерчанту",
  linked: merchantColumn,
};

const adminTable: CompactTable = { searchHint: "Поиск по логину/telegram" };

export const compactTables: Partial<Record<UserRole, CompactTable>> = {
  cascade: {
    searchHint: "Поиск по логину/telegram или каскаду",
    linked: cascadeColumn,
  },
  merchant: merchantTable,
  merchant_support: merchantTable,
  merchant_agent: merchantTable,
  admin: adminTable,
  super_admin: adminTable,
};

type CompactUserRowProps = UserRowProps & { linked?: LinkedColumn };

export const CompactUserRow = memo(function CompactUserRow({
  user,
  linked,
  ref,
}: CompactUserRowProps) {
  const entity = linked?.entity(user);

  return (
    <UserRowShell ref={ref} columns={cn(compactColumns, "min-h-[54px]")}>
      <LoginCell user={user} />
      {linked && (
        <div>
          {entity ? (
            <EntityChip entity={entity} column={linked} />
          ) : (
            <span className="text-muted-foreground">-</span>
          )}
        </div>
      )}
    </UserRowShell>
  );
});

function EntityChip({
  entity,
  column: { EntityLink, tooltip },
}: {
  entity: EntityRef;
  column: LinkedColumn;
}) {
  const highlight = useContext(HighlightContext);

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <EntityLink
            id={entity.id}
            className="inline-flex rounded-[10px] bg-[#1b2127]/60 px-3.5 py-2 outline-none transition-colors hover:bg-primary/15 hover:text-primary focus-visible:ring-2 focus-visible:ring-ring"
          />
        }
      >
        <Highlighted text={entity.name} part={highlight} />
      </TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  );
}
