// lib/auth/options.ts
import type { NextAuthOptions } from "next-auth";
import type { Adapter } from "next-auth/adapters";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/client";
import { UserRole } from "@prisma/client";

export const authOptions: NextAuthOptions = {
  // Cast explícito para que el tipo del adapter no choque
  adapter: PrismaAdapter(prisma) as Adapter,

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

        // `host` no está tipado en credentials, así que usamos `any`
        const host = (credentials as any).host as string | undefined;
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

        // Intentar detectar workspace por dominio
        if (!workspaceId && domain) {
          const domainMatch = await prisma.workspaceDomain.findUnique({
            where: { domain },
            select: { workspaceId: true },
          });
          if (domainMatch?.workspaceId) {
            const membership = await prisma.userWorkspace.findFirst({
              where: { userId: user.id, workspaceId: domainMatch.workspaceId },
            });
            if (membership) workspaceId = membership.workspaceId;
          }
        }

        // Si todavía no tenemos workspace, usamos el primero del usuario
        if (!workspaceId) {
          const membership = await prisma.userWorkspace.findFirst({
            where: { userId: user.id },
            select: { workspaceId: true },
          });
          workspaceId = membership?.workspaceId;
        }

        // Extendemos el objeto user que NextAuth devolverá al JWT
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          workspaceId,
        } as any;
      },
    }),
  ],

  pages: {
    signIn: "/login",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Aquí usamos `any` porque estamos agregando campos personalizados
        (token as any).id = (user as any).id;
        (token as any).role = ((user as any).role as UserRole) ?? UserRole.sales;
        (token as any).workspaceId = (user as any).workspaceId;
      } else if (!(token as any).workspaceId && token.email) {
        // Si no hay workspaceId en el token pero sí email, lo buscamos en BD
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
          select: { id: true, role: true, workspaceId: true },
        });
        if (dbUser) {
          (token as any).id = dbUser.id;
          (token as any).role = dbUser.role;
          (token as any).workspaceId = dbUser.workspaceId;
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        // Igual, usamos `any` para los campos extra en session.user
        (session.user as any).id = ((token as any).id as string) ?? "";
        (session.user as any).role = ((token as any).role as UserRole) ?? UserRole.sales;
        (session.user as any).workspaceId = ((token as any).workspaceId as string) ?? "";
      }
      return session;
    },
  },

  secret: process.env.AUTH_SECRET,
};
