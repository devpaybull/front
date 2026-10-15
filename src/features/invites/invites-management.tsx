import { useIsFetching } from "@tanstack/react-query";
import { SearchInput } from "@/components/ui/search-input";
import { CreateInviteDialog } from "./create-invite-dialog";

type InvitesManagementProps = {
  text: string;
  onTextChange: (text: string) => void;
};

export function InvitesManagement({
  text,
  onTextChange,
}: InvitesManagementProps) {
  const fetching = useIsFetching({ queryKey: ["invites", "list"] }) > 0;

  return (
    <div className="flex items-center gap-4">
      <SearchInput
        className="flex-1"
        value={text}
        onChange={(event) => onTextChange(event.target.value)}
        loading={fetching}
        placeholder="Поиск по коду"
        aria-label="Поиск по коду"
      />
      <CreateInviteDialog />
    </div>
  );
}
