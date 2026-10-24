export type SettingCategory =
  | "rates"
  | "fees"
  | "limits"
  | "appeals"
  | "matching"
  | "apk"
  | "integrations"
  | "chats";

export type PlatformSetting = {
  key: string;
  name: string;
  value: string;
  category: SettingCategory;
  deprecated: boolean;
  updatedAt: string;
};

export type PlatformSettingList = {
  items: PlatformSetting[];
  counts: Record<"all" | "deprecated" | SettingCategory, number>;
  stats: { total: number; inTable: number; deprecated: number };
};
