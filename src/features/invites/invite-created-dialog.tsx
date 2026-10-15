import { Check } from "lucide-react";
import CopyIcon from "@/assets/icons/copy.svg?react";
import bull from "@/assets/invite-success-bull.webp";
import glow from "@/assets/invite-success-glow.svg";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { Chip } from "./chip";
import type { Invite } from "./types";

type InviteCreatedDialogProps = {
  invite: Invite | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function InviteCreatedDialog({
  invite,
  open,
  onOpenChange,
}: InviteCreatedDialogProps) {
  const [copied, copy] = useCopyToClipboard();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-[20px]"
        >
          <img
            src={glow}
            alt=""
            className="absolute top-[-62px] left-[59px] w-[366px] max-w-none"
          />
        </div>
        <img
          src={bull}
          alt=""
          className="pointer-events-none absolute -top-[71px] left-[81px] w-[331px] max-w-none"
        />

        <div className="relative flex flex-col items-center gap-6 px-[37px] pt-[255px] pb-[39px]">
          <div className="flex flex-col items-center gap-1.5 text-center">
            <DialogTitle className="text-[19px] leading-none font-bold tracking-[-0.03em]">
              Новый код успешно создан!
            </DialogTitle>
            <DialogDescription className="text-[13px] leading-none tracking-[-0.03em]">
              Передайте код пользователю — он необходим для регистрации
            </DialogDescription>
          </div>

          {invite && (
            <div className="flex items-center gap-1.5">
              <Chip>{invite.code}</Chip>
              <button
                type="button"
                onClick={() => copy(invite.code)}
                aria-label={copied ? "Скопировано" : "Скопировать код"}
                className="grid size-[31px] place-items-center rounded-lg bg-[#1b2127]/80 text-foreground/60 outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
              >
                {copied ? (
                  <Check className="size-5 text-green" />
                ) : (
                  <CopyIcon className="size-5" />
                )}
              </button>
            </div>
          )}

          <DialogClose render={<Button className="w-[293px]" />}>
            Готово
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
