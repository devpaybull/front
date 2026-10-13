import { Link, useLocation, useMatches } from "@tanstack/react-router";
import { cn } from "cn";
import { ChevronDown } from "lucide-react";
import { Fragment, useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { type NavGroupItem, type NavLinkItem, navigation } from "./navigation";

const itemClass =
  "flex h-11 w-full items-center gap-2 rounded-xl border border-transparent px-3 text-[15px] leading-none font-semibold tracking-[-0.02em] whitespace-nowrap outline-none transition-colors hover:bg-panel focus-visible:border-ring";

export function AppSidebar() {
  return (
    <aside className="sticky top-[94px] h-[calc(100svh-94px)] w-[263px] shrink-0 border-r border-border/80">
      <ScrollArea className="h-full">
        <div className="px-5 pt-[30px] pb-6">
          <nav aria-label="Главное меню" className="flex flex-col gap-3.5">
            {navigation.map((section, index) => (
              <Fragment key={section.title}>
                {index > 0 && <hr className="border-border/80" />}
                <div className="flex flex-col gap-2">
                  <h2 className="text-[13px] leading-none font-medium tracking-[-0.02em] text-muted-foreground uppercase">
                    {section.title}
                  </h2>
                  <ul className="flex flex-col gap-1">
                    {section.items.map((item) => (
                      <li key={item.label}>
                        {"to" in item ? (
                          <SidebarLink item={item} />
                        ) : (
                          <SidebarGroup item={item} />
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </Fragment>
            ))}
          </nav>
        </div>
      </ScrollArea>
    </aside>
  );
}

const activeOptions = (item: NavLinkItem) => ({
  exact: item.exact,
  includeSearch: false,
});

const activeClass = "border-border/65 bg-panel text-primary";

function useLitByPage(item: NavLinkItem) {
  return useMatches({
    select: (matches) =>
      matches.some((match) => match.staticData.menuItem === item.to),
  });
}

function SidebarLink({ item }: { item: NavLinkItem }) {
  const Icon = item.icon;
  const lit = useLitByPage(item);

  return (
    <Link
      to={item.to}
      activeOptions={activeOptions(item)}
      className={cn(
        itemClass,
        "data-[status=active]:border-border/65 data-[status=active]:bg-panel data-[status=active]:text-primary",
        lit && activeClass,
      )}
    >
      {Icon && <Icon className="size-5 shrink-0" />}
      <span className="min-w-0 truncate">{item.label}</span>
      {item.badge !== undefined && (
        <span className="ml-auto rounded bg-orange/20 px-1 py-0.5 text-[13px] leading-none font-semibold tracking-[-0.03em] text-orange">
          {item.badge}
        </span>
      )}
    </Link>
  );
}

function SidebarSubLink({ item }: { item: NavLinkItem }) {
  const lit = useLitByPage(item);

  return (
    <Link
      to={item.to}
      activeOptions={activeOptions(item)}
      className={cn(
        "flex h-[31px] items-center rounded-lg px-3 text-[15px] leading-none font-semibold tracking-[-0.02em] whitespace-nowrap text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring data-[status=active]:text-foreground",
        lit && "text-foreground",
      )}
    >
      <span className="min-w-0 truncate">{item.label}</span>
    </Link>
  );
}

function SidebarGroup({ item }: { item: NavGroupItem }) {
  const pathname = useLocation({ select: (location) => location.pathname });
  const Icon = item.icon;
  const hasActiveChild = item.children.some((child) =>
    pathname.startsWith(String(child.to)),
  );
  const [open, setOpen] = useState(hasActiveChild);
  const [wasActive, setWasActive] = useState(hasActiveChild);
  if (hasActiveChild !== wasActive) {
    setWasActive(hasActiveChild);
    if (hasActiveChild) setOpen(true);
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger
        className={cn(itemClass, "group", hasActiveChild && activeClass)}
      >
        {Icon && <Icon className="size-5 shrink-0" />}
        <span className="min-w-0 truncate">{item.label}</span>
        <ChevronDown className="ml-auto size-4 shrink-0 text-foreground transition-transform group-data-[panel-open]:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent className="h-(--collapsible-panel-height) overflow-hidden transition-[height] duration-200 ease-out data-ending-style:h-0 data-starting-style:h-0">
        <ul className="flex flex-col pt-1.5 pb-2 pl-7">
          {item.children.map((child) => (
            <li key={child.label}>
              <SidebarSubLink item={child} />
            </li>
          ))}
        </ul>
      </CollapsibleContent>
    </Collapsible>
  );
}
