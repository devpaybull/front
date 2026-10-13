import { cn } from "cn";

const tones = {
  primary: {
    active: "bg-primary/10 text-primary",
    badge: "bg-primary/20",
    dot: "bg-primary",
  },
  blue: { active: "bg-blue/15 text-blue", badge: "bg-blue/20", dot: "bg-blue" },
  orange: {
    active: "bg-orange/15 text-orange",
    badge: "bg-orange/20",
    dot: "bg-orange",
  },
  green: {
    active: "bg-green/15 text-green",
    badge: "bg-green/20",
    dot: "bg-green",
  },
  neutral: {
    active: "bg-foreground/15 text-foreground",
    badge: "bg-foreground/20",
    dot: "bg-foreground",
  },
};

export type TabTone = keyof typeof tones;

export type CountTab<T extends string> = {
  value: T | undefined;
  label: string;
  count?: number;
  tone?: TabTone;
  dot?: string;
  separatorBefore?: boolean;
};

type CountTabsProps<T extends string> = {
  label: string;
  tabs: CountTab<T>[];
  value: T | undefined;
  onChange: (value: T | undefined) => void;
  countOnHover?: boolean;
};

export function CountTabs<T extends string>({
  label,
  tabs,
  value,
  onChange,
  countOnHover = false,
}: CountTabsProps<T>) {
  return (
    <fieldset className="flex flex-wrap items-center gap-1.5">
      <legend className="sr-only">{label}</legend>
      {tabs.map((tab) => {
        const isActive = tab.value === value;
        const tone = tones[tab.tone ?? "primary"];
        const dot = tab.dot ?? (tab.tone ? tone.dot : undefined);
        return [
          tab.separatorBefore && (
            <span
              key={`${tab.label}-separator`}
              aria-hidden
              className="mx-1.5 h-[25px] w-px bg-border"
            />
          ),
          <button
            key={tab.label}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(tab.value)}
            className={cn(
              "group flex h-[37px] items-center gap-[7px] rounded-[12px] px-3 text-[15px] leading-none font-semibold tracking-[-0.02em] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
              isActive
                ? tone.active
                : "bg-[#1b2127]/60 text-foreground/60 hover:text-foreground",
            )}
          >
            {dot && (
              <span
                aria-hidden
                className={cn("size-[7px] rounded-[2px]", dot)}
              />
            )}
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={cn(
                  "rounded px-1 py-0.5 text-[13px] tracking-[-0.03em]",
                  isActive ? tone.badge : "bg-foreground/10",
                  countOnHover && !isActive && "hidden group-hover:inline",
                )}
              >
                {tab.count}
              </span>
            )}
          </button>,
        ];
      })}
    </fieldset>
  );
}
