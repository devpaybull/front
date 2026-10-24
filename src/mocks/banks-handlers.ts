import { delay } from "msw";
import { HttpResponse, http } from "msw/http";
import type { BankSortField, NewBankForm } from "@/features/banks/schemas";
import type {
  Bank,
  BankList,
  BankOptions,
  BankRequisiteType,
} from "@/features/banks/types";
import { between, seeded } from "./data/user-profiles";

const random = seeded("banks");
const currencies = ["RUB", "TJS", "ARS", "UZS"];
const countryOf: Record<string, string> = {
  RUB: "Россия",
  TJS: "Таджикистан",
  ARS: "Аргентина",
  UZS: "Узбекистан",
};

const names: [string, string, string][] = [
  ["t2", "Т-банк", "RUB"],
  ["sberbank", "Сбербанк", "RUB"],
  ["alfabank", "Альфа-банк", "RUB"],
  ["vtb", "ВТБ", "RUB"],
  ["gazprombank", "Газпромбанк", "RUB"],
  ["raiffeisen", "Райффайзенбанк", "RUB"],
  ["sovcombank", "Совкомбанк", "RUB"],
  ["ozon", "Озон банк", "RUB"],
  ["yandex", "Yandex bank", "RUB"],
  ["mts", "МТС банк", "RUB"],
  ["dc_bank", "Душанбе Сити", "TJS"],
  ["eskhata", "Эсхата", "TJS"],
  ["amonatbonk", "Амонатбонк", "TJS"],
  ["galicia", "Banco Galicia", "ARS"],
  ["santander_ar", "Santander Argentina", "ARS"],
  ["nacion", "Banco Nación", "ARS"],
  ["kapitalbank", "Kapitalbank", "UZS"],
  ["hamkorbank", "Hamkorbank", "UZS"],
];

const types: BankRequisiteType[] = ["p2p", "sbp", "card", "account"];

const banks: Bank[] = names.map(([id, name, currency]) => ({
  id,
  name,
  code: random() > 0.6 ? String(between(random, 100, 999)) : null,
  country: countryOf[currency],
  currency,
  crossBorderCurrencies:
    currency === "RUB" && random() > 0.7 ? ["TJS", "UZS"] : [],
  channels: between(random, 1, 8),
  requisiteTypes: random() > 0.3 ? ["p2p"] : [types[between(random, 0, 3)]],
  active: random() > 0.15,
  automation: random() > 0.5,
  multiRequisites: random() > 0.6,
  askHolderName: random() > 0.5,
}));

const sortValue: Record<BankSortField, (b: Bank) => string | number> = {
  name: (b) => b.name.toLowerCase(),
  channels: (b) => b.channels,
};

const notFound = () =>
  HttpResponse.json({ message: "Банк не найден" }, { status: 404 });

export const banksHandlers = [
  http.get("/api/banks", async ({ request }) => {
    await delay();
    const params = new URL(request.url).searchParams;
    const q = params.get("q")?.trim().toLowerCase();
    const found = q
      ? banks.filter((b) =>
          [b.id, b.name].some((v) => v.toLowerCase().includes(q)),
        )
      : banks;
    const currency = params.get("currency") ?? currencies[0];
    const items = found.filter((b) => b.currency === currency);
    const sort = params.get("sort") as BankSortField | null;
    if (sort) {
      const direction = params.get("order") === "asc" ? 1 : -1;
      items.sort((a, b) => {
        const [x, y] = [sortValue[sort](a), sortValue[sort](b)];
        return (x < y ? -1 : x > y ? 1 : 0) * direction;
      });
    }
    return HttpResponse.json<BankList>({
      items,
      counts: Object.fromEntries(
        currencies.map((c) => [
          c,
          found.filter((b) => b.currency === c).length,
        ]),
      ),
    });
  }),

  http.get("/api/banks/options", async () => {
    await delay();
    return HttpResponse.json<BankOptions>({
      currencies,
      countries: Object.values(countryOf),
    });
  }),

  http.get("/api/banks/:id", async ({ params }) => {
    await delay();
    const bank = banks.find((b) => b.id === params.id);
    return bank ? HttpResponse.json(bank) : notFound();
  }),

  http.post("/api/banks", async ({ request }) => {
    await delay();
    const form = (await request.json()) as Omit<NewBankForm, "country"> & {
      country: string | null;
    };
    if (banks.some((b) => b.id === form.id))
      return HttpResponse.json(
        { message: "Банк с таким идентификатором уже есть" },
        { status: 409 },
      );
    const bank: Bank = {
      ...form,
      code: null,
      channels: 0,
      active: true,
      automation: false,
      multiRequisites: false,
    };
    banks.push(bank);
    return HttpResponse.json(bank, { status: 201 });
  }),

  http.patch("/api/banks/:id", async ({ params, request }) => {
    await delay();
    const bank = banks.find((b) => b.id === params.id);
    if (!bank) return notFound();
    Object.assign(bank, (await request.json()) as Partial<Bank>);
    return new HttpResponse(null, { status: 204 });
  }),
];
