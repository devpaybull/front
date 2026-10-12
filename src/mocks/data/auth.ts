import type { CurrentUser } from "@/features/auth/api";

export const SESSION_KEY = "paybull-mock-session";
export const PENDING_2FA_KEY = "paybull-mock-2fa";

export const demoAccounts: {
  login: string;
  password: string;
  otp: string;
  user: CurrentUser;
}[] = [
  {
    login: "admin",
    password: "paybull-demo",
    otp: "123456",
    user: { id: "admin-1", login: "Alex_fun", role: "admin" },
  },
  {
    login: "superadmin",
    password: "paybull-demo",
    otp: "123456",
    user: { id: "admin-0", login: "Max_root", role: "super_admin" },
  },
];

export const demoUser = demoAccounts[0].user;
