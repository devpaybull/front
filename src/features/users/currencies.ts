export const rateCurrencies = ["RUB", "USD", "EUR", "UAH", "ZL"] as const;

export type RateCurrency = (typeof rateCurrencies)[number];
