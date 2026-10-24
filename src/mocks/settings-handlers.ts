import { subHours } from "date-fns";
import { delay } from "msw";
import { HttpResponse, http } from "msw/http";
import type { SettingTab } from "@/features/platform-settings/schemas";
import type {
  PlatformSetting,
  PlatformSettingList,
  SettingCategory,
} from "@/features/platform-settings/types";
import { between, seeded } from "./data/user-profiles";

const random = seeded("platform-settings");
const now = new Date();

const seed: [SettingCategory, string, string, string, boolean?][] = [
  ["rates", "USDT_RUB_RATE_SOURCE", "Источник курса USDT/RUB", "rapira"],
  ["rates", "RATE_MARKUP_PERCENT", "Наценка к курсу, %", "1.5"],
  ["rates", "RATE_REFRESH_SECONDS", "Обновление курса, сек", "60"],
  ["rates", "BASE_TRADER_RATE", "Базовая ставка трейдера, %", "8"],
  ["fees", "WITHDRAWAL_FEE_USDT", "Комиссия за вывод, USDT", "1"],
  ["fees", "DEPOSIT_FEE_PERCENT", "Комиссия за пополнение, %", "0"],
  ["fees", "PLATFORM_FEE_PERCENT", "Комиссия платформы, %", "2"],
  ["limits", "MIN_DEAL_AMOUNT_RUB", "Минимальная сумма сделки, RUB", "500"],
  ["limits", "MAX_DEAL_AMOUNT_RUB", "Максимальная сумма сделки, RUB", "500000"],
  ["limits", "MIN_INSURANCE_USDT", "Мин. страховой депозит, USDT", "100"],
  [
    "limits",
    "DAILY_REQUISITE_LIMIT_RUB",
    "Дневной лимит реквизита, RUB",
    "1000000",
  ],
  ["appeals", "APPEAL_WINDOW_MINUTES", "Окно для апелляции, мин", "60"],
  ["appeals", "APPEAL_AUTO_CLOSE_HOURS", "Автозакрытие апелляции, ч", "24"],
  ["matching", "DEAL_TTL_MINUTES", "Время на оплату сделки, мин", "15"],
  [
    "matching",
    "MATCHING_STRATEGY",
    "Стратегия подбора трейдера",
    "round_robin",
  ],
  [
    "matching",
    "MAX_ACTIVE_DEALS_PER_TRADER",
    "Одновременных сделок у трейдера",
    "5",
  ],
  ["apk", "MOBILE_APP_VERSION", "Версия мобильного приложения", "1.0.0"],
  ["apk", "MIN_MOBILE_APP_VERSION", "Минимальная версия приложения", "0.9.4"],
  ["apk", "SMS_PARSE_TIMEOUT_SECONDS", "Ожидание SMS, сек", "120"],
  ["integrations", "AML_PROVIDER", "AML-провайдер", "amlbot"],
  ["integrations", "TRON_NODE_URL", "Нода TRON", "https://api.trongrid.io"],
  ["integrations", "CASCADE_TIMEOUT_MS", "Таймаут каскада, мс", "3000"],
  [
    "chats",
    "TELEGRAM_SUPPORT_CHAT",
    "Чат поддержки в Telegram",
    "@paybull_support",
  ],
  ["chats", "NOTIFY_ON_APPEAL", "Уведомлять об апелляциях", "true"],
  ["chats", "NOTIFY_ON_LOW_BALANCE", "Уведомлять о низком балансе", "true"],
  ["rates", "LEGACY_RATE_PROVIDER", "Старый источник курса", "binance", true],
  ["limits", "OLD_DAILY_LIMIT", "Дневной лимит (старый)", "300000", true],
  ["apk", "APK_DOWNLOAD_URL_V1", "Ссылка на APK v1", "https://…/v1.apk", true],
];

const settings: PlatformSetting[] = seed.map(
  ([category, key, name, value, deprecated = false]) => ({
    key,
    name,
    value,
    category,
    deprecated,
    updatedAt: subHours(now, between(random, 1, 24 * 60)).toISOString(),
  }),
);

const categories: SettingCategory[] = [
  "rates",
  "fees",
  "limits",
  "appeals",
  "matching",
  "apk",
  "integrations",
  "chats",
];

export const settingsHandlers = [
  http.get("/api/platform-settings", async ({ request }) => {
    await delay();
    const params = new URL(request.url).searchParams;
    const q = params.get("q")?.trim().toLowerCase();
    const found = q
      ? settings.filter((s) =>
          [s.key, s.name, s.value].some((v) => v.toLowerCase().includes(q)),
        )
      : settings;
    const tab = params.get("tab") as SettingTab | null;
    const current = found.filter((s) => !s.deprecated);
    const items =
      tab === "deprecated"
        ? found.filter((s) => s.deprecated)
        : tab
          ? current.filter((s) => s.category === tab)
          : [...current];
    const direction = params.get("order") === "asc" ? 1 : -1;
    items.sort((a, b) => a.updatedAt.localeCompare(b.updatedAt) * direction);
    return HttpResponse.json<PlatformSettingList>({
      items,
      counts: {
        all: current.length,
        deprecated: found.length - current.length,
        ...(Object.fromEntries(
          categories.map((c) => [
            c,
            current.filter((s) => s.category === c).length,
          ]),
        ) as Record<SettingCategory, number>),
      },
      stats: {
        total: settings.length,
        inTable: settings.filter((s) => !s.deprecated).length,
        deprecated: settings.filter((s) => s.deprecated).length,
      },
    });
  }),

  http.patch("/api/platform-settings/:key", async ({ params, request }) => {
    await delay();
    const setting = settings.find((s) => s.key === params.key);
    if (!setting)
      return HttpResponse.json(
        { message: "Настройка не найдена" },
        { status: 404 },
      );
    const { value } = (await request.json()) as { value: string };
    setting.value = value;
    setting.updatedAt = new Date().toISOString();
    return HttpResponse.json(setting);
  }),
];
