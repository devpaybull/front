import { Autocomplete } from "@base-ui/react/autocomplete";
import ChevronDownIcon from "@/assets/icons/chevron-down.svg?react";

type SuggestInputProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
  placeholder: string;
};

export function SuggestInput({
  id,
  value,
  onChange,
  suggestions,
  placeholder,
}: SuggestInputProps) {
  return (
    <Autocomplete.Root
      items={suggestions}
      value={value}
      onValueChange={onChange}
      openOnInputClick
    >
      <div className="relative">
        <Autocomplete.Input
          id={id}
          placeholder={placeholder}
          className="h-11 w-full min-w-0 rounded-xl border border-input bg-card pr-10 pl-3 text-[15px] font-semibold tracking-[-0.03em] transition-colors outline-none placeholder:text-foreground/40 focus-visible:border-ring data-popup-open:border-ring"
        />
        <Autocomplete.Trigger
          aria-label="Показать варианты"
          className="group absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground outline-none"
        >
          <ChevronDownIcon className="size-5 transition-transform group-data-popup-open:rotate-180" />
        </Autocomplete.Trigger>
      </div>
      <Autocomplete.Portal>
        <Autocomplete.Positioner sideOffset={6} className="isolate z-50">
          <Autocomplete.Popup className="max-h-[min(var(--available-height),240px)] w-(--anchor-width) overflow-y-auto rounded-xl bg-popover p-1.5 text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-none empty:hidden data-closed:animate-out data-closed:fade-out-0 data-open:animate-in data-open:fade-in-0">
            <Autocomplete.List>
              {(item: string) => (
                <Autocomplete.Item
                  key={item}
                  value={item}
                  className="flex cursor-default items-center rounded-lg px-3 py-2.5 text-[15px] leading-none font-medium tracking-[-0.02em] outline-none select-none data-highlighted:bg-accent"
                >
                  {item}
                </Autocomplete.Item>
              )}
            </Autocomplete.List>
          </Autocomplete.Popup>
        </Autocomplete.Positioner>
      </Autocomplete.Portal>
    </Autocomplete.Root>
  );
}
