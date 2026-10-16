import { useState } from "react";

export function useDialog() {
  const [open, setOpen] = useState(false);
  const [key, setKey] = useState(0);
  return {
    key,
    open,
    onOpenChange: setOpen,
    show: () => {
      setKey((k) => k + 1);
      setOpen(true);
    },
    mounted: key > 0,
  };
}
