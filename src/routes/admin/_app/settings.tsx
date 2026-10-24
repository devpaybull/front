import { createFileRoute } from "@tanstack/react-router";
import { ActivityBlock } from "@/features/account/activity-block";
import { BotsBlock } from "@/features/account/bots-block";
import { PasswordBlock, ProfileBlock } from "@/features/account/profile-blocks";

export const Route = createFileRoute("/admin/_app/settings")({
  staticData: {
    title: "Настройки",
    subtitle: "Управление аккаунтом администратора",
  },
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_395px] items-start gap-5">
      <div className="flex flex-col gap-5">
        <ProfileBlock />
        <PasswordBlock />
        <BotsBlock />
      </div>
      <div className="sticky top-[114px]">
        <ActivityBlock />
      </div>
    </div>
  );
}
