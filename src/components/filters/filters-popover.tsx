import { type ReactNode, useState } from "react";
import CloseIcon from "@/assets/icons/close.svg?react";
import FiltersIcon from "@/assets/icons/filters.svg?react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverArrow,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FiltersTriggerBox } from "./filters-trigger";

type FiltersPopoverProps<T> = {
  value: T;
  empty: T;
  onApply: (next: T) => void;
  children: (draft: T, change: (patch: Partial<T>) => void) => ReactNode;
  width?: number;
  label?: string;
  title?: string;
  icon?: ReactNode;
  submitLabel?: string;
  submitting?: boolean;
  activeCount?: number;
  onClear?: () => void;
};

export function FiltersPopover<T>({
  value,
  empty,
  onApply,
  children,
  width = 374,
  label = "Фильтры",
  title = label,
  icon = <FiltersIcon className="size-5" />,
  submitLabel = "Применить",
  submitting = false,
  activeCount = 0,
  onClear,
}: FiltersPopoverProps<T>) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        if (next) setDraft(value);
        setOpen(next);
      }}
    >
      <FiltersTriggerBox
        label={label}
        icon={icon}
        activeCount={activeCount}
        onClear={onClear}
        trigger={(props) => <PopoverTrigger {...props} />}
      />
      <PopoverContent
        side="left"
        sideOffset={13}
        style={{ width }}
        className="gap-0 rounded-[17px] bg-[#15191d] p-5 text-foreground shadow-drop ring-0"
      >
        <PopoverArrow />
        <form
          onSubmit={(event) => {
            event.preventDefault();
            onApply(draft);
            setOpen(false);
          }}
        >
          <header className="flex h-5 items-center justify-between leading-none">
            <div className="flex items-center gap-1.5">
              {icon}
              <PopoverTitle className="text-[17px] font-semibold tracking-[-0.02em]">
                {title}
              </PopoverTitle>
            </div>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setDraft(empty)}
                className="text-[13px] font-semibold tracking-[-0.03em] text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:text-primary"
              >
                Сбросить
              </button>
              <button
                type="button"
                aria-label="Закрыть"
                onClick={() => setOpen(false)}
                className="grid size-5 place-items-center rounded-[6px] text-foreground/60 outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
              >
                <CloseIcon className="size-[17px]" />
              </button>
            </div>
          </header>
          <div className="mt-7 flex flex-col gap-5">
            {children(draft, (patch) =>
              setDraft((current) => ({ ...current, ...patch })),
            )}
          </div>
          <Button
            type="submit"
            disabled={submitting}
            className="mt-7 w-full rounded-[14px]"
          >
            {submitLabel}
          </Button>
        </form>
      </PopoverContent>
    </Popover>
  );
}
