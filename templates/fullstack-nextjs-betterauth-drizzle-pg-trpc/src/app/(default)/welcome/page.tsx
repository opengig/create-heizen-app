import React from "react";
import Link from "next/link";

const WelcomePage: React.FC = () => {
  return (
    <main className="flex h-screen w-full flex-col items-center justify-center gap-2">
      <p>Welcome Page</p>
      <p>
        This is the welcome page, can be used to initiate new users onboarding.
      </p>

      <p>New user gets redirected to this page.</p>

      <Link href="/dashboard" className="underline underline-offset-2">
        Go to Dashboard
      </Link>
    </main>
  );
};

export default WelcomePage;
