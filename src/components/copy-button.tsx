import CopyIcon from "@/assets/icons/copy.svg?react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";

export function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, copy] = useCopyToClipboard();

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            type="button"
            aria-label={label}
            onClick={() => copy(text)}
            className="grid size-5 shrink-0 place-items-center rounded-[6px] text-foreground/60 outline-none transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring"
          />
        }
      >
        <CopyIcon className="size-5" />
      </TooltipTrigger>
      <TooltipContent>{copied ? "Скопировано" : label}</TooltipContent>
    </Tooltip>
  );
}
