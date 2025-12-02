import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/client";
import { UserRole } from "@prisma/client";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        const host = credentials?.host as string | undefined;
        const domain = host ? host.split(":")[0] : undefined;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.hashedPassword) {
          return null;
        }

        const isValid = await bcrypt.compare(credentials.password, user.hashedPassword);
        if (!isValid || !user.active) {
          return null;
        }

        let workspaceId = user.workspaceId ?? undefined;

        if (!workspaceId && domain) {
          const domainMatch = await prisma.workspaceDomain.findUnique({ where: { domain }, select: { workspaceId: true } });
          if (domainMatch?.workspaceId) {
            const membership = await prisma.userWorkspace.findFirst({ where: { userId: user.id, workspaceId: domainMatch.workspaceId } });
            if (membership) workspaceId = membership.workspaceId;
          }
        }

        if (!workspaceId) {
          const membership = await prisma.userWorkspace.findFirst({ where: { userId: user.id }, select: { workspaceId: true } });
          workspaceId = membership?.workspaceId;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          workspaceId,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user.role as UserRole) ?? UserRole.sales;
        token.workspaceId = user.workspaceId;
      } else if (!token.workspaceId && token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
          select: { id: true, role: true, workspaceId: true },
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
          token.workspaceId = dbUser.workspaceId;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) ?? "";
        session.user.role = (token.role as UserRole) ?? UserRole.sales;
        session.user.workspaceId = (token.workspaceId as string) ?? "";
      }
      return session;
    },
  },
  secret: process.env.AUTH_SECRET,
};
