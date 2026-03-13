import { Resend } from "resend";
import { env } from "./env";

const resend = new Resend(env.RESEND_API_KEY);

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${env.APP_URL}/reset-password?token=${token}`;

  await resend.emails.send({
    from: "Cresora <noreply@cresoracommerce.com>",
    to: email,
    subject: "Reset your password",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <h1 style="color: #003350; font-size: 24px; margin-bottom: 16px;">Reset your password</h1>
        <p style="color: #4a5568; font-size: 16px; line-height: 1.5;">
          We received a request to reset your password. Click the button below to choose a new one.
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${resetUrl}" style="background-color: #FC6200; color: white; padding: 12px 32px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">
            Reset password
          </a>
        </div>
        <p style="color: #718096; font-size: 14px; line-height: 1.5;">
          This link will expire in 1 hour. If you didn&apos;t request a password reset, you can safely ignore this email.
        </p>
      </div>
    `,
  });
}
