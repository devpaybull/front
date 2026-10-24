import { z } from "zod";

export const settingTabs = [
  "rates",
  "fees",
  "limits",
  "appeals",
  "matching",
  "apk",
  "integrations",
  "chats",
  "deprecated",
] as const;
export type SettingTab = (typeof settingTabs)[number];

export const settingsSearchSchema = z.object({
  q: z.string().optional().catch(undefined),
  tab: z.enum(settingTabs).optional().catch(undefined),
  sort: z.enum(["updatedAt"]).optional().catch(undefined),
  order: z.enum(["asc", "desc"]).optional().catch(undefined),
});
export type SettingsSearch = z.infer<typeof settingsSearchSchema>;

export const settingValueSchema = z.object({
  value: z.string().trim().min(1, "Введите значение"),
});
export type SettingValueForm = z.infer<typeof settingValueSchema>;
