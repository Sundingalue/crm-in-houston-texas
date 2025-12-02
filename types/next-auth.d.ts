import { DefaultSession } from "next-auth";
import { UserRole } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: UserRole;
      workspaceId: string;
    };
  }

  interface User {
    role: UserRole;
    workspaceId: string;
    hashedPassword?: string;
  }
}
