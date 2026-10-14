import { cn } from "cn";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ALL = "all";

type FilterSelectProps = {
  label?: string;
  allLabel: string;
  options: { value: string; label: string }[];
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  size?: "default" | "md" | "sm";
  id?: string;
  className?: string;
};

export function FilterSelect({
  label,
  allLabel,
  options,
  value,
  onChange,
  size,
  id,
  className,
}: FilterSelectProps) {
  const items = [{ value: ALL, label: allLabel }, ...options];

  return (
    <Select
      items={items}
      value={value ?? ALL}
      onValueChange={(next) =>
        onChange(next === ALL || !next ? undefined : next)
      }
    >
      <SelectTrigger id={id} size={size} className={cn("w-full", className)}>
        <span className="flex min-w-0 gap-1.5">
          {label && <span className="text-muted-foreground">{label}</span>}
          <SelectValue>
            {(current: string) =>
              items.find((item) => item.value === current)?.label ?? ""
            }
          </SelectValue>
        </span>
      </SelectTrigger>
      <SelectContent>
        {items.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
