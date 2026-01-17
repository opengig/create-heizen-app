import { useRouter } from "next/navigation";
import React from "react";
import { authClient } from "~/server/better-auth/client";

interface UseLogoutProps {
  redirectTo?: string;
}

export const useLogout = ({ redirectTo }: UseLogoutProps = {}) => {
  const router = useRouter();

  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const initiateLogout = async () => {
    setIsLoggingOut(true);
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          if (!redirectTo) return;
          router.push(redirectTo);
        },
      },
    });
  };

  return {
    initiateLogout,
    isLoggingOut,
  };
};
