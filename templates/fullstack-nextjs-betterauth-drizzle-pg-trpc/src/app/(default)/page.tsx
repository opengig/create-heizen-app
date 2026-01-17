import React from "react";
import { headers } from "next/headers";

import { auth } from "~/server/better-auth";

// components
import { HomePageClient } from "./HomePageClient";

const HomePage: React.FC = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return <HomePageClient session={session} />;
};

export default HomePage;
