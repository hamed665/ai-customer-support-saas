"use client";

import { usePathname } from "next/navigation";
import { SessionProvider } from "next-auth/react";

/** The public, synthetic workspace has no session or authentication API dependency. */
export function AppSessionProvider({
  children,
  basePath,
}: {
  children: React.ReactNode;
  basePath: string;
}) {
  const pathname = usePathname();
  if (pathname === "/support-demo") {
    return children;
  }
  return <SessionProvider basePath={basePath}>{children}</SessionProvider>;
}
