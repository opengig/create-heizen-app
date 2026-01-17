"use client";

import React from "react";
import Link from "next/link";

// hooks
import { useLogout } from "~/hooks/auth";

// types
import type { Session } from "~/server/better-auth/config";

// components
import { ThemeToggler } from "~/components/common";
import { Button } from "~/components/ui/button";

interface DashboardPageClientProps {
  session: Session;
}

export const DashboardPageClient: React.FC<DashboardPageClientProps> = ({
  session,
}) => {
  const { initiateLogout, isLoggingOut } = useLogout({
    redirectTo: "/login",
  });

  return (
    <main className="flex h-screen w-full flex-col items-center justify-center gap-2">
      <p>Hi {session?.user?.name}, welcome to your dashboard!</p>
      <pre>{JSON.stringify(session, null, 2)}</pre>

      <section className="flex gap-3">
        <ThemeToggler />
        <Button variant="outline" asChild size="sm">
          <Link href="/">Back to Home</Link>
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={initiateLogout}
          isLoading={isLoggingOut}
        >
          Logout
        </Button>
      </section>
    </main>
  );
};
