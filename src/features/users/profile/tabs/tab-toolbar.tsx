import { createContext, type ReactNode, use, useMemo, useState } from "react";
import { createPortal } from "react-dom";

const SlotContext = createContext<{
  slot: HTMLElement | null;
  setSlot: (element: HTMLElement | null) => void;
} | null>(null);

export function TabToolbarProvider({ children }: { children: ReactNode }) {
  const [slot, setSlot] = useState<HTMLElement | null>(null);
  const value = useMemo(() => ({ slot, setSlot }), [slot]);
  return <SlotContext value={value}>{children}</SlotContext>;
}

export function TabToolbarSlot() {
  const context = use(SlotContext);
  return (
    <div
      ref={context?.setSlot}
      className="flex shrink-0 items-center gap-4 empty:hidden"
    />
  );
}

export function TabToolbar({ children }: { children: ReactNode }) {
  const slot = use(SlotContext)?.slot;
  return slot ? createPortal(children, slot) : null;
}
