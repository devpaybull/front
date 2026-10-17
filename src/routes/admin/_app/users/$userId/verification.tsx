import { createFileRoute } from "@tanstack/react-router";
import { VerificationTab } from "@/features/users/profile/tabs/verification-tab";

export const Route = createFileRoute("/admin/_app/users/$userId/verification")({
  component: function Tab() {
    const { userId } = Route.useParams();
    return <VerificationTab userId={userId} />;
  },
});
