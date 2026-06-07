"use client";

import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [
    inferAdditionalFields({
      user: {
        acceptedTermsVersion: {
          type: "string",
          required: false,
        },
        acceptedTermsAt: {
          type: "date",
          required: false,
        },
        ipAddress: {
          type: "string",
          required: false,
        },
      },
    }),
  ],
});

export const { signIn, signUp, signOut, useSession } = authClient;
