"use client";

import { UserButton, useAuth } from "@clerk/nextjs";
import { useEffect } from "react";
import { apiFetch } from "@/lib/api";

export default function DashboardPage() {
  const { getToken } = useAuth();
  async function printToken() {
    const token = await getToken();

    console.log("Token: ", token);
  }
  printToken();

  useEffect(() => {
    async function fetchUser() {
      try {
        const token = await getToken();

        const data = await apiFetch("/me", token ?? undefined);

        console.log("data: ", data);
      } catch (error) {
        console.error(error);
      }
    }

    fetchUser();
  }, [getToken]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <UserButton/>
    </main>
  );
}