import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";

// baseURL defaults to the current origin (Vite dev server on :5173) and the
// default basePath of "/api/auth". The Vite proxy forwards /api to the Express
// server on :3000, so requests stay same-origin and cookies just work.
export const authClient = createAuthClient({
  plugins: [
    // Mirrors the server's `role` additional field so it is typed on the
    // session user. Configured manually to avoid importing server types across
    // the client/server package boundary.
    inferAdditionalFields({
      user: {
        role: { type: "string" },
      },
    }),
  ],
});

export const { signIn, signOut, useSession } = authClient;
