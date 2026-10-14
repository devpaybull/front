import { replaceEqualDeep } from "@tanstack/react-query";
import { useMemo, useRef } from "react";

export function useStableList<T extends { id: string }>(items: T[]): T[] {
  const previous = useRef(new Map<string, T>());

  return useMemo(() => {
    const stable = items.map((item) => {
      const old = previous.current.get(item.id);
      return old ? replaceEqualDeep(old, item) : item;
    });
    previous.current = new Map(stable.map((item) => [item.id, item]));
    return stable;
  }, [items]);
}
