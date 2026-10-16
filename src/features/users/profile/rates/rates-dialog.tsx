import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cn } from "cn";
import { useState } from "react";
import PercentIcon from "@/assets/icons/percent.svg?react";
import PlusIcon from "@/assets/icons/plus.svg?react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { errorMessage } from "@/lib/api";
import { saveUserRates, userRatesQuery } from "../../api";
import { rateCurrencies } from "../../currencies";
import { paymentMethodLabels } from "../../payment-methods";
import type { CurrencyRates, PaymentMethod } from "../../types";
import { MethodEditor } from "./method-editor";
import {
  type DraftCurrency,
  type DraftMethod,
  draftHasErrors,
  emptyMethod,
  fromDraft,
  methodHasErrors,
  toDraft,
} from "./rates-draft";

const allMethods = Object.keys(paymentMethodLabels) as PaymentMethod[];

type RatesDialogProps = {
  userId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function RatesDialog({ userId, open, onOpenChange }: RatesDialogProps) {
  const { data, isError } = useQuery(userRatesQuery(userId));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[min(1371px,calc(100svh-4rem))] w-[866px] flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle>
            <PercentIcon />
            Настроить ставки
          </DialogTitle>
        </DialogHeader>
        {data ? (
          <RatesEditor
            userId={userId}
            initial={data}
            onSaved={() => onOpenChange(false)}
          />
        ) : (
          <p className="px-[38px] py-16 text-center text-[15px] font-semibold text-muted-foreground">
            {isError ? "Не удалось загрузить ставки" : "Загрузка…"}
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}

function RatesEditor({
  userId,
  initial,
  onSaved,
}: {
  userId: string;
  initial: CurrencyRates[];
  onSaved: () => void;
}) {
  const [draft, setDraft] = useState<DraftCurrency[]>(() => toDraft(initial));
  const [currencyIndex, setCurrencyIndex] = useState(0);
  const [methodIndex, setMethodIndex] = useState(0);
  const queryClient = useQueryClient();

  const currency = draft[currencyIndex];
  const method = currency?.methods[methodIndex];
  const hasErrors = draftHasErrors(draft);

  const save = useMutation({
    mutationFn: () => saveUserRates(userId, fromDraft(draft)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      onSaved();
    },
  });

  const setMethod = (next: DraftMethod) =>
    setDraft(
      draft.map((c, ci) =>
        ci === currencyIndex
          ? {
              ...c,
              methods: c.methods.map((m, mi) =>
                mi === methodIndex ? next : m,
              ),
            }
          : c,
      ),
    );

  const pickCurrency = (code: (typeof rateCurrencies)[number]) => {
    const existing = draft.findIndex((c) => c.currency === code);
    if (existing >= 0) {
      setCurrencyIndex(existing);
    } else {
      setDraft([...draft, { currency: code, methods: [] }]);
      setCurrencyIndex(draft.length);
    }
    setMethodIndex(0);
  };

  const pickMethod = (code: PaymentMethod) => {
    if (!currency) return;
    const existing = currency.methods.findIndex((m) => m.method === code);
    if (existing >= 0) {
      setMethodIndex(existing);
      return;
    }
    setDraft(
      draft.map((c, ci) =>
        ci === currencyIndex
          ? { ...c, methods: [...c.methods, emptyMethod(code)] }
          : c,
      ),
    );
    setMethodIndex(currency.methods.length);
  };

  return (
    <>
      <ScrollArea className="min-h-0 flex-1">
        <div className="px-[38px] pb-6">
          <div className="flex flex-wrap gap-3 border-b border-border/80 py-6">
            {draft.map((c, index) => (
              <button
                key={c.currency}
                type="button"
                onClick={() => {
                  setCurrencyIndex(index);
                  setMethodIndex(0);
                }}
                className={cn(
                  "h-[35px] rounded-[12px] px-3 text-[15px] leading-none font-semibold tracking-[-0.02em] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                  index === currencyIndex
                    ? "bg-green/10 text-green"
                    : "bg-[#1b2127]/60 text-foreground/60 hover:text-foreground",
                )}
              >
                {c.currency}
              </button>
            ))}
            <AddMenu
              label="Добавить валюту"
              items={rateCurrencies.map((code) => ({
                value: code,
                label: code,
              }))}
              chosen={draft.map((c) => c.currency)}
              tone="green"
              onPick={(code) =>
                pickCurrency(code as (typeof rateCurrencies)[number])
              }
            />
          </div>

          <div className="flex flex-col gap-[15px] border-b border-border/80 py-6">
            <h3 className="text-[15px] leading-none font-semibold tracking-[-0.02em]">
              Методы
            </h3>
            <div className="flex flex-wrap items-center gap-3">
              {currency?.methods.map((m, index) => (
                <button
                  key={m.method}
                  type="button"
                  onClick={() => setMethodIndex(index)}
                  className={cn(
                    "flex h-[37px] items-center gap-1.5 rounded-[12px] px-3 text-[13px] leading-none font-semibold tracking-[-0.02em] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                    index === methodIndex
                      ? "bg-primary/10 text-primary"
                      : "bg-[#1b2127]/60 text-foreground",
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      "size-[7px] rounded-[2px]",
                      methodHasErrors(m)
                        ? "bg-destructive"
                        : index === methodIndex
                          ? "bg-primary"
                          : "bg-foreground",
                    )}
                  />
                  {paymentMethodLabels[m.method]}
                </button>
              ))}
              <AddMenu
                label="Добавить метод"
                items={allMethods.map((code) => ({
                  value: code,
                  label: paymentMethodLabels[code],
                }))}
                chosen={currency?.methods.map((m) => m.method) ?? []}
                tone="primary"
                onPick={(code) => pickMethod(code as PaymentMethod)}
              />
            </div>
          </div>

          {method ? (
            <MethodEditor
              key={`${currencyIndex}-${methodIndex}`}
              method={method}
              onChange={setMethod}
            />
          ) : (
            <p className="pt-6 text-[15px] leading-none font-semibold text-muted-foreground">
              Добавьте метод, чтобы задать ставки в {currency?.currency}
            </p>
          )}
        </div>
      </ScrollArea>

      <div className="flex shrink-0 flex-wrap items-center justify-between gap-4 border-t border-border/80 px-[38px] py-6">
        <button
          type="button"
          onClick={() =>
            setDraft(
              draft.map((c) => ({
                ...c,
                methods: c.methods.map((m) => ({
                  ...m,
                  byAmount: [],
                  byBank: [],
                })),
              })),
            )
          }
          className="rounded text-[15px] leading-none font-semibold tracking-[-0.02em] text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          Сбросить все настройки
        </button>
        <div className="flex items-center gap-2">
          {save.isError && (
            <span role="alert" className="mr-2 text-[13px] text-destructive">
              {errorMessage(save.error)}
            </span>
          )}
          <DialogClose render={<Button variant="secondary" />}>
            Отменить
          </DialogClose>
          <Button
            disabled={hasErrors || save.isPending}
            onClick={() => save.mutate()}
            title={
              hasErrors ? "Исправьте ошибки, отмеченные красным" : undefined
            }
          >
            Сохранить
          </Button>
        </div>
      </div>
    </>
  );
}

function AddMenu({
  label,
  items,
  chosen,
  tone,
  onPick,
}: {
  label: string;
  items: { value: string; label: string }[];
  chosen: string[];
  tone: "green" | "primary";
  onPick: (value: string) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex h-[35px] items-center gap-2 rounded-[12px] border border-border/60 bg-[#1b2127]/60 px-3 text-[15px] leading-none font-semibold tracking-[-0.02em] outline-none transition-colors hover:bg-[#1b2127] focus-visible:ring-2 focus-visible:ring-ring">
        <PlusIcon className="size-5" />
        {label}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        sideOffset={6}
        className="flex max-h-[min(var(--available-height),260px)] w-auto min-w-[119px] flex-col gap-0.5 rounded-[17px] bg-[#15191d] p-1.5 shadow-[0_4px_16px_rgb(0_0_0/0.25)] ring-0"
      >
        {items.map((item) => (
          <DropdownMenuItem
            key={item.value}
            onClick={() => onPick(item.value)}
            className={cn(
              "h-[35px] rounded-[10px] px-2.5 text-[15px] leading-none font-semibold tracking-[-0.02em]",
              chosen.includes(item.value) &&
                (tone === "green"
                  ? "bg-green/10 text-green focus:bg-green/15 focus:text-green"
                  : "bg-primary/10 text-primary focus:bg-primary/15 focus:text-primary"),
            )}
          >
            {item.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
