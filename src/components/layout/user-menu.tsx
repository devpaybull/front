import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import LogoutIcon from "@/assets/icons/logout.svg?react";
import { LetterAvatar } from "@/components/letter-avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { currentUserQuery, logout } from "@/features/auth/api";
import { userRoleMeta } from "@/features/users/user-role";

export function UserMenu() {
  const { data: user } = useQuery(currentUserQuery());
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    queryClient.clear();
    await navigate({ to: "/admin/login" });
  };

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="group flex h-[54px] items-center gap-[18px] rounded-2xl border border-border/80 bg-panel px-3 outline-none transition-colors focus-visible:border-ring data-popup-open:border-primary">
        <span className="flex items-center gap-2.5 text-left">
          <LetterAvatar name={user.login} className="size-[34px]" />
          <span className="flex flex-col gap-1 leading-none">
            <span className="text-[15px] font-semibold tracking-[-0.02em]">
              {user.login}
            </span>
            <span className="text-sm font-medium tracking-[-0.02em] text-muted-foreground">
              {userRoleMeta[user.role].label}
            </span>
          </span>
        </span>
        <ChevronDown className="size-4 transition-transform group-data-popup-open:rotate-180" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={9}
        className="w-auto min-w-0 rounded-[17px] bg-[#15191d] p-2 shadow-[0_4px_16px_rgb(0_0_0/0.25)] ring-0"
      >
        <DropdownMenuItem
          variant="destructive"
          onClick={handleLogout}
          className="gap-1.5 rounded-lg p-2 text-[15px] leading-none font-semibold tracking-[-0.02em]"
        >
          <LogoutIcon className="size-5" />
          Выйти из аккаунта
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
