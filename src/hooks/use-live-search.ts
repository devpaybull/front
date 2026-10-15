import { useEffect, useState } from "react";
import { useDebouncedValue } from "./use-debounced-value";

export function useLiveSearch(
  query: string | undefined,
  commit: (query: string | undefined) => void,
) {
  const [text, setText] = useState(query ?? "");
  const debounced = useDebouncedValue(text.trim(), 200);

  useEffect(() => {
    if (debounced !== (query ?? "")) commit(debounced || undefined);
  }, [debounced, query, commit]);

  return [text, setText] as const;
}
