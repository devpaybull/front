import CopyIcon from "@/assets/icons/copy.svg?react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";

type PasswordResetDialogProps = {
  password: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function PasswordResetDialog({
  password,
  open,
  onOpenChange,
}: PasswordResetDialogProps) {
  const [copied, copy] = useCopyToClipboard();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col items-center px-[37px] pt-12 pb-12 text-center">
        <DialogTitle className="text-[19px] leading-none font-bold">
          Пароль сброшен
        </DialogTitle>
        <DialogDescription className="mt-1.5 text-[13px] leading-none">
          Скопируйте новый пароль и отправьте его трейдеру
        </DialogDescription>

        <div className="mt-6 flex gap-1.5">
          <span className="flex h-[31px] items-center rounded-[10px] bg-[#1b2127]/80 px-3.5 text-[15px] leading-none font-semibold tracking-[-0.02em] select-all">
            {password}
          </span>
          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  type="button"
                  aria-label="Скопировать пароль"
                  onClick={() => copy(password)}
                  className="grid size-[31px] place-items-center rounded-[8px] bg-[#1b2127]/80 text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                />
              }
            >
              <CopyIcon className="size-4" />
            </TooltipTrigger>
            <TooltipContent>
              {copied ? "Скопировано" : "Копировать"}
            </TooltipContent>
          </Tooltip>
        </div>

        <DialogClose render={<Button className="mt-6 w-[293px]" />}>
          Готово
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
