import {
  type Period,
  periodLabel,
  periodPresets,
  presetOf,
} from "@/components/filters/period";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const chipLabels: Record<string, string> = {
  all: "Все время",
  today: "Сегодня",
  yesterday: "Вчера",
  week: "7 дней",
  month: "30 дней",
};

const CUSTOM = "custom";

export function PeriodChip({
  value,
  onChange,
}: {
  value: Period;
  onChange: (value: Period) => void;
}) {
  const preset = presetOf(value);
  return (
    <Select
      value={preset?.key ?? CUSTOM}
      onValueChange={(key) => {
        const next = periodPresets.find((p) => p.key === key);
        if (next) onChange(next.range());
      }}
    >
      <SelectTrigger className="w-[210px] rounded-[14px] px-3.5">
        <span className="flex min-w-0 gap-1.5">
          <span className="text-muted-foreground">Период:</span>
          <SelectValue>
            {() => (preset ? chipLabels[preset.key] : periodLabel(value))}
          </SelectValue>
        </span>
      </SelectTrigger>
      <SelectContent>
        {periodPresets.map((p) => (
          <SelectItem key={p.key} value={p.key}>
            {chipLabels[p.key]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
