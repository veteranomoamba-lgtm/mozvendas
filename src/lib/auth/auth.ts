import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string | null;
      role: string;
      isBanned: boolean;
      avatar: string | null;
    };
  }
  interface User {
    id: string; email: string; name: string | null;
    role: string; isBanned: boolean; avatar: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string; email: string; name: string | null;
    role: string; isBanned: boolean; avatar: string | null;
  }
}

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error("❌ NEXTAUTH_SECRET não está definido!");
}

export const authOptions: NextAuthOptions = {
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [GoogleProvider({
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          authorization: { params: { prompt: "consent", access_type: "offline", scope: "openid email profile" } },
        })]
      : []),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const email = credentials.email.toLowerCase().trim();
        if (credentials.password.length > 128) return null;

        const user = await db.user.findUnique({ where: { email } });
        if (!user) return null;
        if (user.isBanned) throw new Error("Conta banida. Contacte o suporte.");
        if (!user.password) throw new Error("Use o Google para entrar nesta conta.");

        const ok = await bcrypt.compare(credentials.password, user.password);
        if (!ok) return null;

        return { id: user.id, email: user.email, name: user.name, role: user.role, isBanned: user.isBanned, avatar: user.avatar };
      },
    }),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider === "google" && profile?.email) {
        const existing = await db.user.findUnique({ where: { email: profile.email } });
        if (existing) {
          if (existing.isBanned) throw new Error("Conta banida.");
          if (profile.image && !existing.avatar)
            await db.user.update({ where: { id: existing.id }, data: { avatar: profile.image } });
          return true;
        }
        await db.user.create({
          data: { email: profile.email, name: profile.name || profile.email.split("@")[0], avatar: profile.image, role: "BUYER", password: "" },
        });
        return true;
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id; token.email = user.email; token.name = user.name;
        token.role = user.role; token.isBanned = user.isBanned; token.avatar = user.avatar;
      }
      if (token.email && !token.id) {
        const dbUser = await db.user.findUnique({ where: { email: token.email } });
        if (dbUser) {
          token.id = dbUser.id; token.role = dbUser.role;
          token.isBanned = dbUser.isBanned; token.avatar = dbUser.avatar; token.name = dbUser.name;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = { id: token.id, email: token.email, name: token.name, role: token.role, isBanned: token.isBanned, avatar: token.avatar };
      }
      return session;
    },
  },
  pages: { signIn: "/", error: "/" },
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  secret: process.env.NEXTAUTH_SECRET,
};
