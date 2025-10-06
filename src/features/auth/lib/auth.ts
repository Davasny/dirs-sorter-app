import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins";
import { v7 as uuidv7 } from "uuid";
import { ResendClient } from "@/features/notifications/lib/resend-client";
import { config } from "@/lib/config/config";
import { db } from "@/lib/db/client";
import * as schema from "../db";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema,
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async (ctx) => {
      const resendClient = new ResendClient();
      await resendClient.sendEmail({
        email: ctx.user.email,
        title: "Reset your password",
        content: `Click the link to reset your password: ${ctx.url}`,
      });
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          const resendClient = new ResendClient();
          await resendClient.manageSubscriber({
            action: "add",
            email: user.email,
          });
        },
      },
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async (ctx) => {
      const resendClient = new ResendClient();
      await resendClient.sendEmail({
        email: ctx.user.email,
        title: "Verify your email address",
        content: `
          <p>Click the link below to verify your email address:</p>
          <a href="${ctx.url}">Click this link</a>
        `,
      });
    },
  },
  advanced: {
    database: {
      generateId: () => uuidv7(),
    },
  },
  secret: config.BETTER_AUTH_SECRET,
  plugins: [admin()],
});

export type IUser = (typeof auth.$Infer.Session)["user"];
