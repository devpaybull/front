import loginArt from "@/assets/login-art.webp";
import logo from "@/assets/logo.svg";

export function LoginArt() {
  return (
    <aside className="@container relative size-full overflow-hidden rounded-2xl border border-border/80 bg-panel">
      <img
        src={loginArt}
        alt=""
        className="absolute inset-0 size-full object-cover"
      />
      <div className="absolute inset-x-0 top-[28.7%] bottom-0 bg-linear-to-b from-transparent to-[#0a0d11] to-[74.4%]" />
      <img
        src={logo}
        alt="Paybull"
        className="absolute top-[4.6cqw] left-[3.9cqw] w-[21.3cqw]"
      />
      <p className="absolute right-[2.7cqw] bottom-[3.5cqw] left-[3.3cqw] text-justify font-display text-[8.1cqw] leading-none tracking-[-0.02em] uppercase">
        Админ-панель сервиса Paybull
      </p>
    </aside>
  );
}
