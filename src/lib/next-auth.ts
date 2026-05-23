import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { getServerEnv } from "@/lib/env";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";

const env = getServerEnv();

export const authOptions: NextAuthOptions = {
  adapter: isDatabaseConfigured() ? PrismaAdapter(prisma) : undefined,
  session: {
    strategy: isDatabaseConfigured() ? "database" : "jwt",
  },
  providers:
    env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : [],
  pages: {
    signIn: "/",
  },
  callbacks: {
    session({ session, token, user }) {
      if (session.user) {
        session.user.id = user?.id || token.sub || "";
      }

      return session;
    },
  },
  secret: env.NEXTAUTH_SECRET,
};
