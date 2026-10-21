import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import { apiDelete, apiGet, apiPatch, apiPost, apiPut } from "@/lib/api";
import type { MerchantsSearch } from "./schemas";
import type {
  AttachmentFlags,
  MerchantAttachments,
  MerchantList,
  MerchantOption,
} from "./types";

export const merchantsQuery = (search: MerchantsSearch) =>
  queryOptions({
    queryKey: ["merchants", "list", search],
    queryFn: () => apiGet<MerchantList>("/merchants", search),
    placeholderData: keepPreviousData,
  });

export const merchantGroupsQuery = () =>
  queryOptions({
    queryKey: ["merchants", "groups"],
    queryFn: () => apiGet<MerchantOption[]>("/merchant-groups"),
  });

export const soloMerchantsQuery = () =>
  queryOptions({
    queryKey: ["merchants", "solo"],
    queryFn: () => apiGet<MerchantOption[]>("/merchants/solo"),
  });

type Switches = { enabled?: boolean; exclusive?: boolean };

export const updateMerchant = (id: string, patch: Switches) =>
  apiPatch<void>(`/merchants/${id}`, patch);

export const updateMerchantGroup = (
  id: string,
  patch: Switches & { name?: string },
) => apiPatch<void>(`/merchant-groups/${id}`, patch);

export const createMerchantGroup = (name: string, merchantIds: string[]) =>
  apiPost<MerchantOption>("/merchant-groups", { name, merchantIds });

export const addToMerchantGroup = (groupId: string, merchantIds: string[]) =>
  apiPost<void>(`/merchant-groups/${groupId}/merchants`, { merchantIds });

export const removeFromMerchantGroup = (groupId: string, merchantId: string) =>
  apiDelete<void>(`/merchant-groups/${groupId}/merchants/${merchantId}`);

export const saveMerchantAttachments = (
  id: string,
  attachments: {
    traders: { userId: string; flags: AttachmentFlags }[];
    cascades: { userId: string; flags: AttachmentFlags }[];
  },
) => apiPut<MerchantAttachments>(`/merchants/${id}/attachments`, attachments);

type AttachmentKind = keyof MerchantAttachments;

export const updateMerchantAttachment = (
  id: string,
  kind: AttachmentKind,
  userId: string,
  flags: Partial<AttachmentFlags>,
) => apiPatch<void>(`/merchants/${id}/attachments/${kind}/${userId}`, flags);

export const detachFromMerchant = (
  id: string,
  kind: AttachmentKind,
  userId: string,
) => apiDelete<void>(`/merchants/${id}/attachments/${kind}/${userId}`);
