import { format, parseISO } from "date-fns";
import { delay } from "msw";
import { HttpResponse, http } from "msw/http";
import type { MessageSortField } from "@/features/messages/schemas";
import type {
  Message,
  MessageFilterOptions,
  MessageList,
} from "@/features/messages/types";
import { knownSenders, messages } from "./data/messages";

const sortValue: Record<MessageSortField, (m: Message) => string | number> = {
  number: (m) => m.number,
  createdAt: (m) => m.createdAt,
  sender: (m) => m.sender.name.toLowerCase(),
};

const has = (value: string, part: string | null) =>
  !part || value.toLowerCase().includes(part.trim().toLowerCase());

export const messagesHandlers = [
  http.get("/api/messages", async ({ request }) => {
    await delay();
    const params = new URL(request.url).searchParams;
    const get = (key: string) => params.get(key);
    const q = get("q")?.trim().toLowerCase().replace(/^№/, "");
    const known = new Set(knownSenders.map((s) => s.name));

    const found = messages.filter((m) => {
      const day = format(parseISO(m.createdAt), "yyyy-MM-dd");
      return (
        (!q ||
          String(m.number).includes(q) ||
          m.id.includes(q) ||
          m.text.toLowerCase().includes(q)) &&
        (!get("from") || day >= (get("from") ?? "")) &&
        (!get("to") || day <= (get("to") ?? "")) &&
        has(m.trader.login, get("trader")) &&
        has(m.device, get("device")) &&
        has(m.sender.name, get("sender")) &&
        (get("hideUnknown") !== "true" || known.has(m.sender.name)) &&
        has(m.deal?.id ?? "", get("deal"))
      );
    });
    const type = get("type");
    const items = type ? found.filter((m) => m.type === type) : [...found];
    const sort = get("sort") as MessageSortField | null;
    const direction = get("order") === "asc" ? 1 : -1;
    const by = sortValue[sort ?? "createdAt"];
    items.sort((a, b) => {
      const [x, y] = [by(a), by(b)];
      return (x < y ? -1 : x > y ? 1 : 0) * direction;
    });
    const count = (t: string) => found.filter((m) => m.type === t).length;
    return HttpResponse.json<MessageList>({
      counts: {
        all: found.length,
        push: count("push"),
        sms: count("sms"),
        deposit: count("deposit"),
        statement: count("statement"),
      },
      items,
    });
  }),

  http.get("/api/messages/filter-options", async () => {
    await delay();
    return HttpResponse.json<MessageFilterOptions>({
      traders: [...new Set(messages.map((m) => m.trader.login))].sort(),
      senders: knownSenders.map((s) => s.name),
    });
  }),
];
