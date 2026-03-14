import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import { nextCookies } from "better-auth/next-js";
import { Resend } from "resend";
import bcrypt from "bcryptjs";

const resend = new Resend(process.env.RESEND_API_KEY);

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    password: {
      verify: async ({ hash, password }) => bcrypt.compare(password, hash),
      hash: async (password) => bcrypt.hash(password, 12),
    },
    sendResetPassword: async ({ user, url }) => {
      void resend.emails.send({
        from: process.env.EMAIL_FROM!,
        to: user.email,
        subject: "Reset your password",
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
            <h1 style="color: #003350; font-size: 24px; margin-bottom: 16px;">Reset your password</h1>
            <p style="color: #4a5568; font-size: 16px; line-height: 1.5;">
              We received a request to reset your password. Click the button below to choose a new one.
            </p>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${url}" style="background-color: #FC6200; color: white; padding: 12px 32px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">
                Reset password
              </a>
            </div>
            <p style="color: #718096; font-size: 14px; line-height: 1.5;">
              This link will expire in 1 hour. If you didn&apos;t request a password reset, you can safely ignore this email.
            </p>
          </div>
        `,
      });
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      void resend.emails.send({
        from: process.env.EMAIL_FROM!,
        to: user.email,
        subject: "Verify your email address",
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
            <h1 style="color: #003350; font-size: 24px; margin-bottom: 16px;">Verify your email address</h1>
            <p style="color: #4a5568; font-size: 16px; line-height: 1.5;">
              Thanks for signing up! Please verify your email address by clicking the button below.
            </p>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${url}" style="background-color: #FC6200; color: white; padding: 12px 32px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">
                Verify email
              </a>
            </div>
            <p style="color: #718096; font-size: 14px; line-height: 1.5;">
              This link will expire in 24 hours. If you didn&apos;t create an account, you can safely ignore this email.
            </p>
          </div>
        `,
      });
    },
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
  },
  plugins: [nextCookies()],
});
