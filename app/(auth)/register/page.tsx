import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/options";
import { AuthScreen } from "@/components/auth/AuthScreen";

export default async function RegisterPage() {
  const session = await getServerSession(authOptions);
  if (session) {
    redirect("/dashboard");
  }
  return <AuthScreen mode="register" />;
}
