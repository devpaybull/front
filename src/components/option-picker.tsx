import { Combobox } from "@base-ui/react/combobox";
import ChevronDownIcon from "@/assets/icons/chevron-down.svg?react";

export type PickerOption = { id: string; name: string };

type OptionPickerProps = {
  id?: string;
  options: PickerOption[];
  value: PickerOption | null;
  onChange: (option: PickerOption | null) => void;
  placeholder: string;
  loading?: boolean;
  invalid?: boolean;
  describedBy?: string;
};

export function OptionPicker({
  id,
  options,
  value,
  onChange,
  placeholder,
  loading = false,
  invalid,
  describedBy,
}: OptionPickerProps) {
  return (
    <Combobox.Root
      items={options}
      value={value}
      onValueChange={onChange}
      itemToStringLabel={(option) => option.name}
      isItemEqualToValue={(a, b) => a.id === b.id}
    >
      <div className="relative">
        <Combobox.Input
          id={id}
          placeholder={placeholder}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          className="h-11 w-full min-w-0 rounded-xl border border-input bg-card pr-10 pl-3 text-[15px] font-semibold tracking-[-0.03em] transition-colors outline-none placeholder:text-foreground/40 focus-visible:border-ring aria-invalid:border-destructive data-popup-open:border-ring"
        />
        <Combobox.Trigger
          aria-label="Показать список"
          className="group absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground outline-none"
        >
          <ChevronDownIcon className="size-5 transition-transform group-data-popup-open:rotate-180" />
        </Combobox.Trigger>
      </div>

      <Combobox.Portal>
        <Combobox.Positioner sideOffset={6} className="isolate z-50">
          <Combobox.Popup className="max-h-[min(var(--available-height),264px)] w-(--anchor-width) origin-(--transform-origin) overflow-y-auto rounded-xl bg-popover p-1.5 text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 outline-none data-closed:animate-out data-closed:fade-out-0 data-open:animate-in data-open:fade-in-0">
            <Combobox.Empty className="px-3 py-2.5 text-[15px] leading-none font-medium tracking-[-0.02em] text-muted-foreground empty:hidden">
              {loading ? "Загрузка…" : "Ничего не нашлось"}
            </Combobox.Empty>
            <Combobox.List>
              {(option: PickerOption) => (
                <Combobox.Item
                  key={option.id}
                  value={option}
                  className="flex cursor-default items-center rounded-lg px-3 py-2.5 text-[15px] leading-none font-medium tracking-[-0.02em] outline-none select-none data-highlighted:bg-accent"
                >
                  {option.name}
                </Combobox.Item>
              )}
            </Combobox.List>
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>
  );
}
