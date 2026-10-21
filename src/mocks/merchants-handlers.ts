import { delay } from "msw";
import { HttpResponse, http } from "msw/http";
import type {
  MerchantPeriod,
  MerchantSortField,
} from "@/features/merchants/schemas";
import type {
  AttachmentFlags,
  Merchant,
  MerchantAttachments,
  MerchantGroup,
  MerchantList,
  MerchantListItem,
  MerchantMethod,
  MerchantOption,
} from "@/features/merchants/types";
import {
  merchantGroups,
  merchants,
  payInMethods,
  payOutMethods,
} from "./data/merchants";
import { users } from "./data/users";

const periodFactor: Record<MerchantPeriod, number> = {
  today: 1,
  yesterday: 0.9,
  week: 6.5,
  month: 27,
  all: 140,
};

const scaled = (methods: MerchantMethod[], factor: number) =>
  methods.map((m) => ({
    ...m,
    volume: String(Math.round(Number(m.volume) * factor)),
  }));

function groupMethods(
  members: Merchant[],
  pick: (m: Merchant) => MerchantMethod[],
  order: MerchantMethod["method"][],
): MerchantMethod[] {
  return order.map((method) => {
    const rows = members.flatMap((m) =>
      pick(m).filter((row) => row.method === method),
    );
    const rates = rows.map((row) => Number(row.rate));
    const [min, max] = [Math.min(...rates), Math.max(...rates)];
    return {
      method,
      state: rows.some((row) => row.state === "on") ? "on" : "off",
      volume: String(rows.reduce((sum, row) => sum + Number(row.volume), 0)),
      rate: min === max ? String(min) : `${min}–${max}`,
    };
  });
}

function makeGroup(
  group: (typeof merchantGroups)[number],
  members: Merchant[],
): MerchantGroup {
  return {
    ...group,
    balance: members.reduce((sum, m) => sum + Number(m.balance), 0).toFixed(2),
    enabled: members.some((m) => m.enabled),
    exclusive: members.length > 0 && members.every((m) => m.exclusive),
    payIn: groupMethods(members, (m) => m.payIn, payInMethods),
    payOut: groupMethods(members, (m) => m.payOut, payOutMethods),
    merchants: members,
  };
}

const sortValue: Record<
  MerchantSortField,
  (item: MerchantListItem) => string | number
> = {
  id: (item) => item.id,
  balance: (item) => Number(item.balance),
};

function list(params: URLSearchParams): MerchantList {
  const q = params.get("q")?.trim().toLowerCase();
  const status = params.get("status");
  const exclusive = params.get("exclusive");
  const factor =
    periodFactor[(params.get("period") as MerchantPeriod) ?? "today"] ?? 1;

  const fitsText = (m: Merchant) =>
    !q || [m.id, m.name, m.login].some((v) => v.toLowerCase().includes(q));
  const fitsSwitches = (m: Merchant) =>
    (!status || m.enabled === (status === "on")) &&
    (!exclusive || m.exclusive === (exclusive === "on"));
  const fits = (m: Merchant) => fitsText(m) && fitsSwitches(m);
  const withPeriod = (m: Merchant): Merchant => ({
    ...m,
    payIn: scaled(m.payIn, factor),
    payOut: scaled(m.payOut, factor),
  });

  const items: MerchantListItem[] = [];
  for (const group of merchantGroups) {
    const byName = !!q && group.name.toLowerCase().includes(q);
    const members = merchants
      .filter(
        (m) => m.groupId === group.id && (byName ? fitsSwitches(m) : fits(m)),
      )
      .map(withPeriod);
    if (members.length > 0)
      items.push({ kind: "group", ...makeGroup(group, members) });
  }
  for (const m of merchants) {
    if (m.groupId === null && fits(m))
      items.push({ kind: "merchant", ...withPeriod(m) });
  }

  const sort = params.get("sort") as MerchantSortField | null;
  if (sort) {
    const direction = params.get("order") === "asc" ? 1 : -1;
    const by = sortValue[sort];
    items.sort((a, b) => {
      const [x, y] = [by(a), by(b)];
      return (x < y ? -1 : x > y ? 1 : 0) * direction;
    });
  }
  return { items };
}

const notFound = (what: string) =>
  HttpResponse.json({ message: `${what} не найден` }, { status: 404 });

function dropEmptyGroups() {
  for (let n = merchantGroups.length - 1; n >= 0; n--) {
    if (!merchants.some((m) => m.groupId === merchantGroups[n].id))
      merchantGroups.splice(n, 1);
  }
}

const isKind = (kind: unknown): kind is keyof MerchantAttachments =>
  kind === "traders" || kind === "cascades";

export const merchantsHandlers = [
  http.get("/api/merchants", async ({ request }) => {
    await delay();
    return HttpResponse.json<MerchantList>(
      list(new URL(request.url).searchParams),
    );
  }),

  http.get("/api/merchants/solo", async () => {
    await delay();
    return HttpResponse.json<MerchantOption[]>(
      merchants
        .filter((m) => m.groupId === null)
        .map(({ id, name }) => ({ id, name })),
    );
  }),

  http.get("/api/merchant-groups", async () => {
    await delay();
    return HttpResponse.json<MerchantOption[]>(
      merchantGroups.map(({ id, name }) => ({ id, name })),
    );
  }),

  http.patch("/api/merchants/:id", async ({ params, request }) => {
    await delay();
    const merchant = merchants.find((m) => m.id === params.id);
    if (!merchant) return notFound("Мерчант");
    const patch = (await request.json()) as Partial<
      Pick<Merchant, "enabled" | "exclusive">
    >;
    Object.assign(merchant, patch);
    return new HttpResponse(null, { status: 204 });
  }),

  http.patch("/api/merchant-groups/:id", async ({ params, request }) => {
    await delay();
    const group = merchantGroups.find((g) => g.id === params.id);
    if (!group) return notFound("Группа");
    const { name, ...switches } = (await request.json()) as {
      name?: string;
      enabled?: boolean;
      exclusive?: boolean;
    };
    if (name !== undefined) {
      if (merchantGroups.some((g) => g.id !== group.id && g.name === name))
        return HttpResponse.json(
          { message: "Группа с таким названием уже есть" },
          { status: 409 },
        );
      group.name = name;
    }
    for (const m of merchants) {
      if (m.groupId === group.id) Object.assign(m, switches);
    }
    return new HttpResponse(null, { status: 204 });
  }),

  http.post("/api/merchant-groups", async ({ request }) => {
    await delay();
    const { name, merchantIds } = (await request.json()) as {
      name: string;
      merchantIds: string[];
    };
    if (merchantGroups.some((g) => g.name === name))
      return HttpResponse.json(
        { message: "Группа с таким названием уже есть" },
        { status: 409 },
      );
    const group = { id: `group-${Date.now()}`, name };
    merchantGroups.push(group);
    for (const m of merchants) {
      if (merchantIds.includes(m.id)) m.groupId = group.id;
    }
    dropEmptyGroups();
    return HttpResponse.json<MerchantOption>(group, { status: 201 });
  }),

  http.post(
    "/api/merchant-groups/:id/merchants",
    async ({ params, request }) => {
      await delay();
      const group = merchantGroups.find((g) => g.id === params.id);
      if (!group) return notFound("Группа");
      const { merchantIds } = (await request.json()) as {
        merchantIds: string[];
      };
      for (const m of merchants) {
        if (merchantIds.includes(m.id)) m.groupId = group.id;
      }
      dropEmptyGroups();
      return new HttpResponse(null, { status: 204 });
    },
  ),

  http.delete(
    "/api/merchant-groups/:id/merchants/:merchantId",
    async ({ params }) => {
      await delay();
      const merchant = merchants.find(
        (m) => m.id === params.merchantId && m.groupId === params.id,
      );
      if (!merchant) return notFound("Мерчант");
      merchant.groupId = null;
      dropEmptyGroups();
      return new HttpResponse(null, { status: 204 });
    },
  ),

  http.put("/api/merchants/:id/attachments", async ({ params, request }) => {
    await delay();
    const merchant = merchants.find((m) => m.id === params.id);
    if (!merchant) return notFound("Мерчант");
    const body = (await request.json()) as Record<
      keyof MerchantAttachments,
      { userId: string; flags: AttachmentFlags }[]
    >;
    for (const kind of ["traders", "cascades"] as const) {
      merchant[kind] = body[kind].flatMap(({ userId, flags }) => {
        const user = users.find((u) => u.id === userId);
        return user ? [{ id: user.id, login: user.login, flags }] : [];
      });
    }
    return HttpResponse.json<MerchantAttachments>({
      traders: merchant.traders,
      cascades: merchant.cascades,
    });
  }),

  http.patch(
    "/api/merchants/:id/attachments/:kind/:userId",
    async ({ params, request }) => {
      await delay();
      const merchant = merchants.find((m) => m.id === params.id);
      if (!merchant || !isKind(params.kind)) return notFound("Мерчант");
      const attached = merchant[params.kind].find(
        (a) => a.id === params.userId,
      );
      if (!attached) return notFound("Пользователь");
      Object.assign(
        attached.flags,
        (await request.json()) as Partial<AttachmentFlags>,
      );
      return new HttpResponse(null, { status: 204 });
    },
  ),

  http.delete(
    "/api/merchants/:id/attachments/:kind/:userId",
    async ({ params }) => {
      await delay();
      const merchant = merchants.find((m) => m.id === params.id);
      if (!merchant || !isKind(params.kind)) return notFound("Мерчант");
      merchant[params.kind] = merchant[params.kind].filter(
        (a) => a.id !== params.userId,
      );
      return new HttpResponse(null, { status: 204 });
    },
  ),
];
