import { Switch as SwitchPrimitive } from "@base-ui/react/switch";
import { cn } from "cn";

function Switch({
  className,
  size = "md",
  ...props
}: SwitchPrimitive.Root.Props & { size?: "sm" | "md" }) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "group/switch relative inline-flex shrink-0 items-center rounded-full outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background data-checked:bg-primary data-unchecked:bg-[#3c3c43]/80 data-disabled:cursor-not-allowed data-disabled:opacity-50",
        size === "md" ? "h-7 w-16 p-[2px]" : "h-5 w-[47px] p-[1.5px]",
        className,
      )}
      {...props}
    >
      <span
        aria-hidden
        className={cn(
          "absolute w-px bg-foreground opacity-0 transition-opacity group-data-checked/switch:opacity-100",
          size === "md" ? "left-[12px] h-2.5" : "left-[9px] h-[7px]",
        )}
      />
      <span
        aria-hidden
        className={cn(
          "absolute rounded-full border border-[#b3b3b3] opacity-0 transition-opacity group-data-unchecked/switch:opacity-100",
          size === "md" ? "right-[7px] size-2.5" : "right-[5px] size-[7px]",
        )}
      />
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "relative rounded-full bg-foreground transition-transform duration-200",
          size === "md"
            ? "h-6 w-[39px] data-checked:translate-x-[21px]"
            : "h-[17px] w-[28px] data-checked:translate-x-[16px]",
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
