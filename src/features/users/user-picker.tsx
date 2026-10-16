import { Combobox } from "@base-ui/react/combobox";
import { useQuery } from "@tanstack/react-query";
import { cn } from "cn";
import { useMemo, useState } from "react";
import ChevronDownIcon from "@/assets/icons/chevron-down.svg?react";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { usersQuery } from "./api";
import type { UserRef, UserRole } from "./types";
import { userRoleMeta } from "./user-role";

type UserPickerProps = {
  id?: string;
  value: UserRef | null;
  onChange: (user: UserRef | null) => void;
  roles: UserRole[];
  excludeId?: string;
  placeholder: string;
  withChevron?: boolean;
  invalid?: boolean;
  describedBy?: string;
};

export function UserPicker({
  id,
  value,
  onChange,
  roles,
  excludeId,
  placeholder,
  withChevron = false,
  invalid,
  describedBy,
}: UserPickerProps) {
  const [text, setText] = useState("");
  const q = useDebouncedValue(text.trim(), 200);
  const { data, isFetching } = useQuery(usersQuery({ q: q || undefined }));

  const found = useMemo(
    () =>
      (data?.items ?? []).filter(
        (user) => roles.includes(user.role) && user.id !== excludeId,
      ),
    [data, roles, excludeId],
  );
  const roleOf = new Map(found.map((user) => [user.id, user.role]));

  return (
    <Combobox.Root
      items={found}
      value={value}
      onValueChange={(user) =>
        onChange(user ? { id: user.id, login: user.login } : null)
      }
      onInputValueChange={setText}
      itemToStringLabel={(user) => user.login}
      isItemEqualToValue={(a, b) => a.id === b.id}
      filter={null}
    >
      <div className="relative">
        <Combobox.Input
          id={id}
          placeholder={placeholder}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          className={cn(
            "h-11 w-full min-w-0 rounded-xl border border-input bg-card px-3 text-[15px] font-semibold tracking-[-0.03em] transition-colors outline-none placeholder:text-foreground/40 focus-visible:border-ring aria-invalid:border-destructive data-popup-open:border-ring",
            withChevron && "pr-10",
          )}
        />
        {withChevron && (
          <Combobox.Trigger
            aria-label="Показать список"
            className="group absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground outline-none"
          >
            <ChevronDownIcon className="size-5 transition-transform group-data-popup-open:rotate-180" />
          </Combobox.Trigger>
        )}
      </div>

      <Combobox.Portal>
        <Combobox.Positioner sideOffset={6} className="isolate z-50">
          <Combobox.Popup className="max-h-[min(var(--available-height),264px)] w-(--anchor-width) origin-(--transform-origin) overflow-y-auto rounded-xl bg-popover p-1.5 text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 outline-none data-closed:animate-out data-closed:fade-out-0 data-open:animate-in data-open:fade-in-0">
            <Combobox.Empty className="px-3 py-2.5 text-[15px] leading-none font-medium tracking-[-0.02em] text-muted-foreground empty:hidden">
              {isFetching ? "Ищем…" : "Никого не нашлось"}
            </Combobox.Empty>
            <Combobox.List>
              {(user: UserRef) => {
                const role = roleOf.get(user.id);
                return (
                  <Combobox.Item
                    key={user.id}
                    value={user}
                    className="flex cursor-default items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-[15px] leading-none font-medium tracking-[-0.02em] outline-none select-none data-highlighted:bg-accent"
                  >
                    {user.login}
                    {role && (
                      <span className="text-[13px] text-muted-foreground">
                        {userRoleMeta[role].label}
                      </span>
                    )}
                  </Combobox.Item>
                );
              }}
            </Combobox.List>
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>
  );
}
