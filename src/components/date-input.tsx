import { addDays, format, isValid, parse, startOfToday } from "date-fns";
import { useState } from "react";
import { ru } from "react-day-picker/locale";
import CalendarIcon from "@/assets/icons/calendar.svg?react";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const DISPLAY_FORMAT = "dd.MM.yyyy";

function maskDate(input: string) {
  const digits = input.replace(/\D/g, "").slice(0, 8);
  return [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4)]
    .filter(Boolean)
    .join(".");
}

function parseDisplay(value: string) {
  const date = parse(value, DISPLAY_FORMAT, new Date());
  return value.length === 10 && isValid(date) ? date : undefined;
}

type DateInputProps = {
  value: string;
  onChange: (value: string) => void;
  minDate?: Date;
  id?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
};

export function DateInput({
  value,
  onChange,
  minDate = addDays(startOfToday(), 1),
  ...inputProps
}: DateInputProps) {
  const [open, setOpen] = useState(false);
  const selected = parseDisplay(value);

  return (
    <div className="relative">
      <Input
        inputMode="numeric"
        autoComplete="off"
        placeholder="00.00.0000"
        value={value}
        onChange={(event) => onChange(maskDate(event.target.value))}
        className="pr-11"
        {...inputProps}
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          aria-label="Выбрать дату в календаре"
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-xl text-foreground/60 outline-none transition-colors hover:text-foreground focus-visible:text-primary"
        >
          <CalendarIcon className="size-5" />
        </PopoverTrigger>
        <PopoverContent
          align="end"
          sideOffset={6}
          className="w-auto rounded-[14px] bg-[#15191d] p-2.5 shadow-drop ring-0"
        >
          <Calendar
            mode="single"
            locale={ru}
            selected={selected}
            defaultMonth={selected && selected >= minDate ? selected : minDate}
            disabled={{ before: minDate }}
            onSelect={(date) => {
              if (!date) return;
              onChange(format(date, DISPLAY_FORMAT));
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
