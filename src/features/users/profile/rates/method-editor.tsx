import { Fragment, useId } from "react";
import CloseIcon from "@/assets/icons/close.svg?react";
import PlusIcon from "@/assets/icons/plus.svg?react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { paymentMethodLabels } from "../../payment-methods";
import { rateBanks } from "./banks";
import { RangeBar } from "./range-bar";
import { PercentInput, RowDivider, RowMessage, RowStatus } from "./rate-fields";
import {
  checkBanks,
  checkRanges,
  type DraftBank,
  type DraftMethod,
  type DraftRange,
  groupDigits,
  isPercent,
  nextBank,
  nextRange,
  rangeBar,
} from "./rates-draft";

const bankItems = rateBanks.map((bank) => ({ value: bank, label: bank }));

type MethodEditorProps = {
  method: DraftMethod;
  onChange: (method: DraftMethod) => void;
};

export function MethodEditor({ method, onChange }: MethodEditorProps) {
  const id = useId();
  const label = paymentMethodLabels[method.method];
  const rangeChecks = checkRanges(method.byAmount);
  const bankChecks = checkBanks(method.byBank);
  const segments = rangeBar(method.byAmount);

  const setRange = (key: string, patch: Partial<DraftRange>) =>
    onChange({
      ...method,
      byAmount: method.byAmount.map((r) =>
        r.key === key ? { ...r, ...patch } : r,
      ),
    });
  const setBank = (key: string, patch: Partial<DraftBank>) =>
    onChange({
      ...method,
      byBank: method.byBank.map((b) =>
        b.key === key ? { ...b, ...patch } : b,
      ),
    });

  return (
    <div className="flex flex-col">
      <div className="mt-6 flex flex-wrap items-center justify-between gap-6 rounded-2xl border border-dashed border-border/80 p-5">
        <div className="flex max-w-[383px] flex-col gap-2 leading-none tracking-[-0.02em]">
          <h3 className="text-[15px] leading-[18px] font-semibold">
            Ставка {label}
          </h3>
          <p className="text-[13px] leading-4 font-medium text-muted-foreground">
            Базовая ставка {label} — применяется, если сумма операции не попала
            ни в один из диапазонов ниже.
          </p>
        </div>
        <div className="flex gap-3.5">
          {(["payIn", "payOut"] as const).map((side) => (
            <div key={side} className="flex flex-col gap-1.5">
              <Label htmlFor={`${id}-base-${side}`}>
                {side === "payIn" ? "Pay-in" : "Pay-out"}
              </Label>
              <PercentInput
                label={`Базовая ставка ${side === "payIn" ? "Pay-in" : "Pay-out"}`}
                value={method[side]}
                onChange={(value) => onChange({ ...method, [side]: value })}
                invalid={!isPercent(method[side])}
                className="w-[157px]"
              />
            </div>
          ))}
        </div>
      </div>

      <h3 className="mt-6 text-[15px] leading-none font-semibold tracking-[-0.02em]">
        Ставки по сумме
      </h3>
      {segments.length > 0 && (
        <div className="mt-[27px]">
          <RangeBar segments={segments} />
        </div>
      )}
      <hr className="mt-6 border-border/80" />

      {method.byAmount.length > 0 && (
        <>
          <ColumnTitles first={["От", "До"]} />
          <div className="mt-3.5 flex flex-col gap-2.5">
            {method.byAmount.map((range, index) => {
              const check = rangeChecks.get(range.key) ?? { ok: true, bad: {} };
              return (
                <Fragment key={range.key}>
                  {index > 0 && <hr className="border-border/80" />}
                  <div className="flex flex-col gap-3.5">
                    <div className="flex items-center">
                      <Input
                        aria-label="От"
                        inputMode="numeric"
                        autoComplete="off"
                        value={range.from}
                        onChange={(e) =>
                          setRange(range.key, { from: e.target.value })
                        }
                        onBlur={() =>
                          setRange(range.key, { from: groupDigits(range.from) })
                        }
                        aria-invalid={check.bad.from}
                        className="w-[166px] shrink-0 aria-invalid:text-destructive"
                      />
                      <Input
                        aria-label="До"
                        inputMode="numeric"
                        autoComplete="off"
                        value={range.to}
                        onChange={(e) =>
                          setRange(range.key, { to: e.target.value })
                        }
                        onBlur={() =>
                          setRange(range.key, { to: groupDigits(range.to) })
                        }
                        aria-invalid={check.bad.to}
                        className="ml-2.5 w-[166px] shrink-0 aria-invalid:text-destructive"
                      />
                      <RowDivider />
                      <PercentInput
                        label="Pay-in"
                        value={range.payIn}
                        onChange={(payIn) => setRange(range.key, { payIn })}
                        invalid={check.bad.payIn}
                      />
                      <PercentInput
                        label="Pay-out"
                        value={range.payOut}
                        onChange={(payOut) => setRange(range.key, { payOut })}
                        invalid={check.bad.payOut}
                        className="ml-2.5"
                      />
                      <RowDivider />
                      <RowStatus check={check} />
                      <RemoveButton
                        label="Убрать диапазон"
                        onClick={() =>
                          onChange({
                            ...method,
                            byAmount: method.byAmount.filter(
                              (r) => r.key !== range.key,
                            ),
                          })
                        }
                      />
                    </div>
                    {!check.ok && check.message && (
                      <RowMessage>{check.message}</RowMessage>
                    )}
                  </div>
                </Fragment>
              );
            })}
          </div>
          <hr className="mt-2.5 border-border/80" />
        </>
      )}

      <AddButton
        onClick={() =>
          onChange({
            ...method,
            byAmount: [...method.byAmount, nextRange(method)],
          })
        }
      >
        Добавить новый диапазон по чекам
      </AddButton>

      <hr className="-mx-[38px] mt-6 border-border/80" />

      <h3 className="mt-6 text-[15px] leading-none font-semibold tracking-[-0.02em]">
        Ставки по банкам
      </h3>
      {method.byBank.length > 0 && (
        <>
          <ColumnTitles first={["Банк"]} />
          <div className="mt-3.5 flex flex-col gap-2.5">
            {method.byBank.map((row, index) => {
              const check = bankChecks.get(row.key) ?? { ok: true, bad: {} };
              return (
                <Fragment key={row.key}>
                  {index > 0 && <hr className="border-border/80" />}
                  <div className="flex flex-col gap-3.5">
                    <div className="flex items-center">
                      <Select
                        items={bankItems}
                        value={row.bank || null}
                        onValueChange={(bank) =>
                          setBank(row.key, { bank: bank ?? "" })
                        }
                      >
                        <SelectTrigger
                          aria-label="Банк"
                          aria-invalid={check.bad.bank}
                          className="w-[342px] shrink-0 font-semibold"
                        >
                          <SelectValue>
                            {(value: string | null) =>
                              value ?? (
                                <span className="text-foreground/40">
                                  Выберите банк
                                </span>
                              )
                            }
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {bankItems.map((item) => (
                            <SelectItem key={item.value} value={item.value}>
                              {item.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <RowDivider />
                      <PercentInput
                        label="Pay-in"
                        value={row.payIn}
                        onChange={(payIn) => setBank(row.key, { payIn })}
                        invalid={check.bad.payIn}
                      />
                      <PercentInput
                        label="Pay-out"
                        value={row.payOut}
                        onChange={(payOut) => setBank(row.key, { payOut })}
                        invalid={check.bad.payOut}
                        className="ml-2.5"
                      />
                      <RowDivider />
                      <RowStatus check={check} />
                      <RemoveButton
                        label="Убрать банк"
                        onClick={() =>
                          onChange({
                            ...method,
                            byBank: method.byBank.filter(
                              (b) => b.key !== row.key,
                            ),
                          })
                        }
                      />
                    </div>
                    {!check.ok && check.message && (
                      <RowMessage>{check.message}</RowMessage>
                    )}
                  </div>
                </Fragment>
              );
            })}
          </div>
          <hr className="mt-2.5 border-border/80" />
        </>
      )}

      <AddButton
        onClick={() =>
          onChange({ ...method, byBank: [...method.byBank, nextBank(method)] })
        }
      >
        Добавить новый банк
      </AddButton>
    </div>
  );
}

function ColumnTitles({ first }: { first: string[] }) {
  return (
    <div className="mt-3 flex text-[15px] leading-none font-semibold tracking-[-0.02em] text-muted-foreground">
      {first.length === 2 ? (
        <>
          <span className="w-[166px] pl-3">{first[0]}</span>
          <span className="ml-2.5 w-[166px] pl-3">{first[1]}</span>
        </>
      ) : (
        <span className="w-[342px] pl-3">{first[0]}</span>
      )}
      <span className="ml-[41px] w-[100px] pl-3">Pay-in</span>
      <span className="ml-2.5 w-[100px] pl-3">Pay-out</span>
    </div>
  );
}

function RemoveButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="ml-auto grid size-5 shrink-0 place-items-center rounded text-foreground/60 outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
    >
      <CloseIcon className="size-5" />
    </button>
  );
}

function AddButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: string;
}) {
  return (
    <Button
      type="button"
      variant="secondary"
      onClick={onClick}
      className="mt-6 w-fit gap-2 rounded-[12px] border-border/60 bg-[#1b2127]/60 px-4 font-semibold"
    >
      <PlusIcon className="size-5" />
      {children}
    </Button>
  );
}
