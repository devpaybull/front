import { cn } from "cn";
import { LoaderCircle } from "lucide-react";
import CloseIcon from "@/assets/icons/close.svg?react";
import SearchIcon from "@/assets/icons/search.svg?react";
import { Input } from "./input";

function SearchInput({
  className,
  loading = false,
  onClear,
  ...props
}: Omit<React.ComponentProps<"input">, "type"> & {
  loading?: boolean;
  onClear?: () => void;
}) {
  const filled = Boolean(props.value);
  return (
    <div className={cn("relative", className)}>
      <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-6 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        className="pr-10 pl-[43px] [&::-webkit-search-cancel-button]:appearance-none"
        {...props}
      />
      {loading && (
        <LoaderCircle
          aria-hidden
          className={cn(
            "pointer-events-none absolute top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground",
            onClear && filled ? "right-11" : "right-3.5",
          )}
        />
      )}
      {onClear && filled && (
        <button
          type="button"
          aria-label="Очистить поиск"
          onClick={onClear}
          className="absolute top-1/2 right-3 grid size-6 -translate-y-1/2 place-items-center rounded-[6px] text-foreground/60 outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          <CloseIcon className="size-5" />
        </button>
      )}
    </div>
  );
}

export { SearchInput };
