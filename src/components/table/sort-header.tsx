import { cn } from "cn";
import SortArrowIcon from "@/assets/icons/sort-arrow.svg?react";

type SortHeaderProps = {
  label: string;
  active: boolean;
  ascending: boolean;
  onClick: () => void;
};

export function SortHeader({
  label,
  active,
  ascending,
  onClick,
}: SortHeaderProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Сортировать: ${label}`}
      aria-pressed={active}
      className="flex w-fit items-center gap-[3px] text-left outline-none focus-visible:underline"
    >
      {label}
      <span
        className={cn(
          "grid size-6 place-items-center rounded-[7px] transition-colors",
          active ? "bg-[#14191e] text-foreground" : "text-foreground/60",
        )}
      >
        <SortArrowIcon
          className={cn(
            "size-4 transition-transform",
            active && ascending && "rotate-180",
          )}
        />
      </span>
    </button>
  );
}
