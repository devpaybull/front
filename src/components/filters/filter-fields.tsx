import { Autocomplete } from "@base-ui/react/autocomplete";
import { format, parseISO } from "date-fns";
import { type ReactNode, useId, useRef, useState } from "react";
import { ru } from "react-day-picker/locale";
import CalendarIcon from "@/assets/icons/calendar.svg?react";
import ChevronIcon from "@/assets/icons/chevron-down-20.svg?react";
import { FilterSelect } from "@/components/filter-select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type Period, periodLabel, periodPresets, presetOf } from "./period";

const labelClass =
  "pl-3 text-[13px] leading-none font-semibold tracking-[-0.03em]";

export function FilterField({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {htmlFor ? (
        <label htmlFor={htmlFor} className={labelClass}>
          {label}
        </label>
      ) : (
        <span className={labelClass}>{label}</span>
      )}
      {children}
    </div>
  );
}

export function SelectFilterField({
  label,
  allLabel,
  options,
  value,
  onChange,
}: {
  label: string;
  allLabel: string;
  options: { value: string; label: string }[];
  value: string | undefined;
  onChange: (value: string | undefined) => void;
}) {
  const id = useId();
  return (
    <FilterField label={label} htmlFor={id}>
      <FilterSelect
        id={id}
        size="md"
        allLabel={allLabel}
        options={options}
        value={value}
        onChange={onChange}
        className="bg-muted font-semibold tracking-[-0.03em]"
      />
    </FilterField>
  );
}

const CUSTOM = "custom";

export function PeriodFilterField({
  value,
  onChange,
}: {
  value: Period;
  onChange: (value: Period) => void;
}) {
  const id = useId();
  const [calendarOpen, setCalendarOpen] = useState(false);
  const firstDay = useRef<Date | null>(null);
  const preset = presetOf(value);

  const pick = (day: Date) => {
    const iso = format(day, "yyyy-MM-dd");
    const first = firstDay.current;
    if (!first) {
      firstDay.current = day;
      onChange({ from: iso, to: iso });
      return;
    }
    const firstIso = format(first, "yyyy-MM-dd");
    onChange(
      first <= day ? { from: firstIso, to: iso } : { from: iso, to: firstIso },
    );
    firstDay.current = null;
    setCalendarOpen(false);
  };

  return (
    <FilterField label="Период" htmlFor={id}>
      <div className="flex h-[38px] items-center rounded-[12px] border border-border bg-muted pr-3 has-focus-visible:border-ring">
        <Select
          value={preset?.key ?? CUSTOM}
          onValueChange={(key) => {
            const next = periodPresets.find((p) => p.key === key);
            if (next) onChange(next.range());
          }}
        >
          <SelectTrigger
            id={id}
            size="md"
            className="h-full min-w-0 flex-1 border-0 bg-transparent pr-0 font-semibold tracking-[-0.03em]"
          >
            <SelectValue>{() => periodLabel(value)}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {periodPresets.map((p) => (
              <SelectItem key={p.key} value={p.key}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span aria-hidden className="mx-2 h-[18px] w-px bg-border" />
        <Popover
          open={calendarOpen}
          onOpenChange={(open) => {
            firstDay.current = null;
            setCalendarOpen(open);
          }}
        >
          <PopoverTrigger
            aria-label="Выбрать даты в календаре"
            className="grid size-5 place-items-center rounded-[6px] text-foreground/80 outline-none transition-colors hover:text-foreground focus-visible:text-primary"
          >
            <CalendarIcon className="size-5" />
          </PopoverTrigger>
          <PopoverContent
            align="end"
            sideOffset={10}
            className="w-auto rounded-[14px] bg-[#1b2127] p-2.5 shadow-drop ring-0"
          >
            <Calendar
              mode="range"
              locale={ru}
              selected={
                value.from
                  ? {
                      from: parseISO(value.from),
                      to: value.to ? parseISO(value.to) : undefined,
                    }
                  : undefined
              }
              defaultMonth={value.from ? parseISO(value.from) : undefined}
              disabled={{ after: new Date() }}
              onSelect={(_, day) => pick(day)}
            />
          </PopoverContent>
        </Popover>
      </div>
    </FilterField>
  );
}

const rangeInputClass =
  "h-9 w-full min-w-0 rounded-[12px] border border-border bg-muted px-3 text-center text-[15px] leading-none font-semibold tracking-[-0.03em] outline-none transition-colors placeholder:text-foreground/40 focus-visible:border-ring";

const digits = (input: string) => input.replace(/\D/g, "").slice(0, 12);

export function RangeFilterField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: { from?: string; to?: string };
  onChange: (value: { from?: string; to?: string }) => void;
}) {
  const id = useId();
  const set = (key: "from" | "to", input: string) =>
    onChange({ ...value, [key]: digits(input) || undefined });

  return (
    <FilterField label={label} htmlFor={id}>
      <div className="flex gap-2.5">
        <input
          id={id}
          inputMode="numeric"
          autoComplete="off"
          placeholder="0"
          aria-label={`${label}: от`}
          value={value.from ?? ""}
          onChange={(event) => set("from", event.target.value)}
          className={rangeInputClass}
        />
        <input
          inputMode="numeric"
          autoComplete="off"
          placeholder="0"
          aria-label={`${label}: до`}
          value={value.to ?? ""}
          onChange={(event) => set("to", event.target.value)}
          className={rangeInputClass}
        />
      </div>
    </FilterField>
  );
}

const textInputClass =
  "h-[38px] w-full min-w-0 rounded-[12px] border border-border bg-muted px-3 text-[15px] leading-none font-semibold tracking-[-0.03em] outline-none transition-colors placeholder:text-foreground/40 focus-visible:border-ring";

export function TextFilterField({
  label,
  placeholder,
  value,
  onChange,
  numeric = false,
}: {
  label: string;
  placeholder: string;
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  numeric?: boolean;
}) {
  const id = useId();
  return (
    <FilterField label={label} htmlFor={id}>
      <input
        id={id}
        autoComplete="off"
        inputMode={numeric ? "numeric" : undefined}
        placeholder={placeholder}
        value={value ?? ""}
        onChange={(event) => {
          const input = numeric
            ? digits(event.target.value)
            : event.target.value;
          onChange(input.trim() ? input : undefined);
        }}
        className={textInputClass}
      />
    </FilterField>
  );
}

export function AutocompleteFilterField({
  label,
  placeholder,
  suggestions,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  suggestions: string[];
  value: string | undefined;
  onChange: (value: string | undefined) => void;
}) {
  const id = useId();
  return (
    <FilterField label={label} htmlFor={id}>
      <Autocomplete.Root
        items={suggestions}
        value={value ?? ""}
        onValueChange={(next) => onChange(next.trim() ? next : undefined)}
        openOnInputClick
      >
        <div className="relative">
          <Autocomplete.Input
            id={id}
            placeholder={placeholder}
            className={`${textInputClass} pr-10 data-popup-open:border-ring`}
          />
          <Autocomplete.Trigger
            aria-label="Показать варианты"
            className="group absolute inset-y-0 right-0 flex w-10 items-center justify-center text-foreground/60 outline-none"
          >
            <ChevronIcon className="size-5 transition-transform group-data-popup-open:rotate-180" />
          </Autocomplete.Trigger>
        </div>
        <Autocomplete.Portal>
          <Autocomplete.Positioner sideOffset={6} className="isolate z-50">
            <Autocomplete.Popup className="max-h-[min(var(--available-height),240px)] w-(--anchor-width) overflow-y-auto rounded-xl bg-popover p-1.5 text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-none data-closed:animate-out data-closed:fade-out-0 data-open:animate-in data-open:fade-in-0">
              <Autocomplete.Empty className="px-3 py-2.5 text-[15px] leading-none font-medium tracking-[-0.02em] text-muted-foreground empty:hidden">
                Ничего похожего
              </Autocomplete.Empty>
              <Autocomplete.List>
                {(item: string) => (
                  <Autocomplete.Item
                    key={item}
                    value={item}
                    className="cursor-default rounded-lg px-3 py-2.5 text-[15px] leading-none font-medium tracking-[-0.02em] outline-none select-none data-highlighted:bg-accent"
                  >
                    {item}
                  </Autocomplete.Item>
                )}
              </Autocomplete.List>
            </Autocomplete.Popup>
          </Autocomplete.Positioner>
        </Autocomplete.Portal>
      </Autocomplete.Root>
    </FilterField>
  );
}
