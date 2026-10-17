import { createFileRoute } from "@tanstack/react-router";
import { ReferralTab } from "@/features/users/profile/tabs/referral-tab";

export const Route = createFileRoute("/admin/_app/users/$userId/referral")({
  component: function Tab() {
    const { userId } = Route.useParams();
    return <ReferralTab userId={userId} />;
  },
});
