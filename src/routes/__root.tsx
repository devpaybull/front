import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { MotionConfig } from "motion/react";

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  return (
    <MotionConfig reducedMotion="user">
      <Outlet />
      <ReactQueryDevtools buttonPosition="bottom-left" />
      <TanStackRouterDevtools position="bottom-right" />
    </MotionConfig>
  );
}
