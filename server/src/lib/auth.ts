import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "../db";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
  },
  session: {
    // Sessions time out after 5 minutes of inactivity. updateAge: 0 refreshes
    // the expiry on every authenticated request, so active users stay signed
    // in while an idle session is invalidated after 5 minutes.
    expiresIn: 60 * 5, // 5 minutes
    updateAge: 0,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "agent",
      },
    },
  },
  trustedOrigins: [process.env.CLIENT_URL || "http://localhost:5173"],
});
