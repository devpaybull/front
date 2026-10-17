import BankIcon from "@/assets/icons/bank.svg?react";
import tbankUrl from "@/assets/icons/tbank.svg";

const logos: Record<string, string> = { "Т-банк": tbankUrl };

export function BankLogo({ bank }: { bank: string }) {
  const logo = logos[bank];
  return logo ? (
    <img src={logo} alt="" className="size-5" />
  ) : (
    <BankIcon aria-hidden className="size-5 text-foreground/60" />
  );
}
