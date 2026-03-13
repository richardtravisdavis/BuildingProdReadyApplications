import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        const email = credentials.email as string;
        const password = credentials.password as string;

        if (!email || !password) return null;

        let user;
        try {
          const rows = await db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);
          user = rows[0];
          console.log("[auth] user found:", !!user, "email:", email);
        } catch (err) {
          console.error("[auth] DB error:", err);
          return null;
        }

        if (!user || !user.password) {
          console.log("[auth] no user or no password hash");
          return null;
        }

        const isValid = await bcrypt.compare(password, user.password);
        console.log("[auth] bcrypt compare result:", isValid);
        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
