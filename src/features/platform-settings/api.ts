import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import { apiGet, apiPatch } from "@/lib/api";
import type { SettingsSearch } from "./schemas";
import type { PlatformSetting, PlatformSettingList } from "./types";

export const settingsQuery = (search: SettingsSearch) =>
  queryOptions({
    queryKey: ["platform-settings", "list", search],
    queryFn: () => apiGet<PlatformSettingList>("/platform-settings", search),
    placeholderData: keepPreviousData,
  });

export const updateSetting = (key: string, value: string) =>
  apiPatch<PlatformSetting>(`/platform-settings/${key}`, { value });
