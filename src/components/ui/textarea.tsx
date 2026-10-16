import { cn } from "cn";
import type * as React from "react";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-[118px] max-h-[320px] w-full resize-none rounded-xl border border-input bg-card px-3 py-3 text-base font-semibold tracking-[-0.03em] transition-colors outline-none placeholder:text-foreground/40 focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-40 aria-invalid:border-destructive md:text-[15px]",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
