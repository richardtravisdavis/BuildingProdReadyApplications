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

        console.log("[auth] authorize called, email:", email, "hasPassword:", !!password, "pwLen:", password?.length, "pwChars:", JSON.stringify(password));

        if (!email || !password) {
          console.log("[auth] missing email or password");
          return null;
        }

        try {
          const rows = await db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

          const user = rows[0];
          console.log("[auth] user found:", !!user);

          if (!user || !user.password) {
            console.log("[auth] no user or no password");
            return null;
          }

          const isValid = await bcrypt.compare(password, user.password);
          console.log("[auth] bcrypt result:", isValid);

          if (!isValid) return null;

          return {
            id: user.id,
            name: user.name,
            email: user.email,
          };
        } catch (err) {
          console.error("[auth] authorize error:", err);
          return null;
        }
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
