"use client";

import React from "react";
import Link from "next/link";

import { api } from "~/trpc/react";

// components
import { ThemeToggler } from "~/components/common";
import { Button } from "~/components/ui/button";
import type { Session } from "~/server/better-auth/config";

interface HomePageClientProps {
  session: Session | null;
}

export const HomePageClient: React.FC<HomePageClientProps> = ({ session }) => {
  const [data, setData] = React.useState({
    message: "",
    rawResponse: {},
  });
  const getPublicMessageMutation = api.message.getPublicMessage.useMutation({
    onSettled: (response) => {
      if (response) {
        setData({
          message: `${response?.data?.message ?? response.message} (Rate limit - ${response.rateLimit.remaining} / 10)`,
          rawResponse: response,
        });
      } else {
        setData({
          message: "No response",
          rawResponse: {},
        });
      }
    },
  });

  const getProtectedMessageMutation =
    api.message.getProtectedMessage.useMutation({
      onSettled: (response) => {
        if (response) {
          setData({
            message: `${response?.data?.message ?? response.message} (Rate limit - ${response.rateLimit.remaining} / 5)`,
            rawResponse: response,
          });
        } else {
          setData({
            message: "No response",
            rawResponse: {},
          });
        }
      },
    });

  return (
    <main className="flex h-screen w-full flex-col items-center justify-center gap-2">
      <p>built using create-heizen-app</p>
      <p>NextJs BetterAuth Drizzle PostgreSQL (tRPC + react query)</p>

      <section className="mt-8 flex items-center gap-3">
        {session?.session.id ? (
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        ) : (
          <Button asChild variant="outline" size="sm">
            <Link href="/login">Login</Link>
          </Button>
        )}
        <ThemeToggler />
      </section>

      <section className="mt-8 flex w-full max-w-3xl flex-col items-end gap-1">
        <div className="flex w-full flex-col gap-3">
          <div>
            <p className="text-sm">Test rate limiting and authentication</p>
            <div className="bg-card mt-2 flex items-center rounded-lg border p-3 text-sm">
              <p>{!!data.message ? data.message : "No message available"}</p>
            </div>
          </div>

          <div>
            <p className="text-sm">Raw response</p>
            <div className="bg-card mt-2 flex items-center rounded-lg border p-3 font-mono text-sm">
              <pre>{JSON.stringify(data.rawResponse, null, 2)}</pre>
            </div>
          </div>
        </div>

        <section className="mt-2 flex items-center gap-3">
          <Button
            size="sm"
            variant="outline"
            disabled={
              getPublicMessageMutation.isPending ||
              getProtectedMessageMutation.isPending
            }
            onClick={() => {
              getPublicMessageMutation.mutateAsync();
            }}
          >
            Get Public Message
          </Button>

          <Button
            size="sm"
            variant="outline"
            disabled={
              getProtectedMessageMutation.isPending ||
              getPublicMessageMutation.isPending
            }
            onClick={() => {
              getProtectedMessageMutation.mutateAsync();
            }}
          >
            Get Protected Message
          </Button>
        </section>
        <p className="text-muted-foreground mt-1 px-1 text-sm">
          Public and Protected messages have different rate limits.
        </p>
      </section>
    </main>
  );
};
