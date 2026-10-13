import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { getSessionUser } from "@/features/auth/session";

export const Route = createFileRoute("/admin/_app")({
  beforeLoad: async () => {
    const user = await getSessionUser();
    if (!user) {
      throw redirect({ to: "/admin/login" });
    }
  },
  component: AppLayout,
});

function AppLayout() {
  return (
    <div className="min-h-svh">
      <AppHeader />
      <div className="flex">
        <AppSidebar />
        <main className="min-w-0 flex-1 p-5">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
