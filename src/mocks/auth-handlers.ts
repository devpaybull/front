import { delay } from "msw";
import { HttpResponse, http } from "msw/http";
import type { Credentials, Otp } from "@/features/auth/schemas";
import { demoAccounts, PENDING_2FA_KEY, SESSION_KEY } from "./data/auth";

const error = (status: number, message: string) =>
  HttpResponse.json({ message }, { status });

export const authHandlers = [
  http.post("/api/auth/login", async ({ request }) => {
    await delay();
    const { login, password } = (await request.json()) as Credentials;
    const account = demoAccounts.find(
      (a) => a.login === login && a.password === password,
    );
    if (!account) return error(401, "Неверный логин или пароль");
    sessionStorage.setItem(PENDING_2FA_KEY, account.login);
    return HttpResponse.json({ twoFactorRequired: true });
  }),

  http.post("/api/auth/2fa", async ({ request }) => {
    await delay();
    const { code } = (await request.json()) as Otp;
    const account = demoAccounts.find(
      (a) => a.login === sessionStorage.getItem(PENDING_2FA_KEY),
    );
    if (!account) return error(401, "Сначала введите логин и пароль");
    if (code !== account.otp) return error(400, "Неверный код");
    sessionStorage.removeItem(PENDING_2FA_KEY);
    localStorage.setItem(SESSION_KEY, account.login);
    return HttpResponse.json(account.user);
  }),

  http.post("/api/auth/logout", async () => {
    await delay();
    localStorage.removeItem(SESSION_KEY);
    return new HttpResponse(null, { status: 204 });
  }),

  http.get("/api/me", async () => {
    await delay();
    const account = demoAccounts.find(
      (a) => a.login === localStorage.getItem(SESSION_KEY),
    );
    if (!account) return error(401, "Нужно войти");
    return HttpResponse.json(account.user);
  }),
];
