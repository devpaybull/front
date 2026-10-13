import { Link, useMatches } from "@tanstack/react-router";
import logo from "@/assets/logo.svg";
import { UserMenu } from "./user-menu";

export function AppHeader() {
  const page = useMatches({
    select: (matches) => {
      const match = matches.findLast((m) => m.staticData.title);
      if (!match) return undefined;
      const { title, subtitle, heading } = match.staticData;
      return {
        title:
          heading?.(match.params as Record<string, string>, match.loaderData) ??
          title,
        subtitle,
      };
    },
  });

  return (
    <header className="sticky top-0 z-20 flex h-[94px] items-center justify-between border-b border-border/80 bg-background px-5">
      <div className="flex items-center gap-[60px]">
        <Link to="/" className="block w-[203px] px-[5px] py-[2px]">
          <img src={logo} alt="Paybull" className="w-full" />
        </Link>
        {page?.title && (
          <div className="flex flex-col gap-1.5 leading-none tracking-[-0.02em]">
            <h1 className="text-[19px] font-semibold">{page.title}</h1>
            {page.subtitle && (
              <p className="text-sm font-medium text-muted-foreground">
                {page.subtitle}
              </p>
            )}
          </div>
        )}
      </div>
      <UserMenu />
    </header>
  );
}
