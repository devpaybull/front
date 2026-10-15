import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import { apiGet, apiPost } from "@/lib/api";
import type { InvitesSearch, NewInvite } from "./schemas";
import type { Invite, InviteList } from "./types";

export const invitesQuery = (search: InvitesSearch) =>
  queryOptions({
    queryKey: ["invites", "list", search],
    queryFn: () => apiGet<InviteList>("/invites", search),
    placeholderData: keepPreviousData,
  });

export const createInvite = (values: NewInvite) =>
  apiPost<Invite>("/invites", values);

export const extendInvite = (id: string, validUntil: string) =>
  apiPost<Invite>(`/invites/${id}/extend`, { validUntil });

export const stopInvite = (id: string) =>
  apiPost<Invite>(`/invites/${id}/stop`);
