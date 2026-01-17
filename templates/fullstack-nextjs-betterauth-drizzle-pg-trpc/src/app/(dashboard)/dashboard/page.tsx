import React from "react";
import { headers } from "next/headers";

// utils
import { checkAuthServer } from "~/lib/auth";

// components
import { DashboardPageClient } from "./DashboardPageClient";

const DashboardPage: React.FC = async () => {
  const { session } = await checkAuthServer({
    headers: await headers(),
    redirectTo: "/login",
  });

  if (!session?.user.id) {
    return (
      <main className="flex h-screen w-full flex-col items-center justify-center gap-2">
        <p>Please login to access your dashboard.</p>
      </main>
    );
  }

  return <DashboardPageClient session={session} />;
};

export default DashboardPage;
