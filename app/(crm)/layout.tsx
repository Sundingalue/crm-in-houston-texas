import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/options";

export default async function CrmLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }
  return <AppShell user={session.user}>{children}</AppShell>;
}
