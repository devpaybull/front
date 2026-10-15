import { format, parseISO, startOfToday } from "date-fns";
import { delay } from "msw";
import { HttpResponse, http } from "msw/http";
import type { InviteSortField, NewInvite } from "@/features/invites/schemas";
import type { Invite, InviteList } from "@/features/invites/types";
import { demoUser } from "./data/auth";
import { generateInviteCode, invites } from "./data/invites";

const error = (status: number, message: string) =>
  HttpResponse.json({ message }, { status });

const sortValue: Record<InviteSortField, (invite: Invite) => string | number> =
  {
    code: (invite) => invite.code,
    rate: (invite) => Number(invite.rate.payIn.max),
    deposit: (invite) => Number(invite.minInsuranceDeposit.payIn),
    validUntil: (invite) => invite.validUntil,
  };

export const invitesHandlers = [
  http.get("/api/invites", async ({ request }) => {
    await delay();
    const params = new URL(request.url).searchParams;
    const q = params.get("q")?.trim().toUpperCase();
    const status = params.get("status");
    const sort = params.get("sort") as InviteSortField | null;
    const direction = params.get("order") === "asc" ? 1 : -1;

    const found = q ? invites.filter((i) => i.code.includes(q)) : invites;
    const counts: InviteList["counts"] = {
      all: found.length,
      active: found.filter((i) => i.status === "active").length,
      used: found.filter((i) => i.status === "used").length,
      expired: found.filter((i) => i.status === "expired").length,
    };

    const items = status
      ? found.filter((i) => i.status === status)
      : [...found];
    items.sort((a, b) => {
      const [x, y] = sort
        ? [sortValue[sort](a), sortValue[sort](b)]
        : [b.createdAt, a.createdAt];
      return (x < y ? -1 : x > y ? 1 : 0) * (sort ? direction : 1);
    });

    return HttpResponse.json<InviteList>({ counts, items });
  }),

  http.post("/api/invites", async ({ request }) => {
    await delay();
    const body = (await request.json()) as NewInvite;
    const invite: Invite = {
      id: crypto.randomUUID(),
      code: generateInviteCode(),
      status: "active",
      role: body.role,
      telegram: body.telegram,
      validUntil: body.validUntil,
      createdAt: new Date().toISOString(),
      creator: demoUser.login,
      usedBy: null,
      rate: {
        payIn: { min: "0", max: "14" },
        payOut: { min: "0", max: "2.5" },
      },
      minInsuranceDeposit: { payIn: "500", payOut: "500" },
    };
    invites.unshift(invite);
    return HttpResponse.json(invite, { status: 201 });
  }),

  http.post("/api/invites/:id/extend", async ({ params, request }) => {
    await delay();
    const invite = invites.find((i) => i.id === params.id);
    if (!invite) return error(404, "Код не найден");
    if (invite.status === "used") {
      return error(409, "Код уже использован");
    }
    const { validUntil } = (await request.json()) as { validUntil: string };
    if (validUntil <= invite.validUntil) {
      return error(400, "Новая дата должна быть позже текущей");
    }
    invite.validUntil = validUntil;
    if (parseISO(validUntil) > startOfToday()) invite.status = "active";
    return HttpResponse.json(invite);
  }),

  http.post("/api/invites/:id/stop", async ({ params }) => {
    await delay();
    const invite = invites.find((i) => i.id === params.id);
    if (!invite) return error(404, "Код не найден");
    if (invite.status !== "active") {
      return error(409, "Остановить можно только активный код");
    }
    invite.status = "expired";
    invite.validUntil = format(new Date(), "yyyy-MM-dd");
    return HttpResponse.json(invite);
  }),
];
