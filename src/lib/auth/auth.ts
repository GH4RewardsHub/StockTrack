import { betterAuth } from "better-auth";
import { Pool } from "pg";
import { createAuthMiddleware } from "better-auth/api";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL environment variable is missing! " +
    "Please make sure it is configured in your environment variables (e.g., in the Vercel dashboard)."
  );
}

export const auth = betterAuth({
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),
  rateLimit: {
    enabled: true,
    window: 60,
    max: 100,
  },
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  user: {
    modelName: "users",
    fields: {
      emailVerified: "email_verified",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
    additionalFields: {
      acceptedTermsVersion: {
        type: "string",
        fieldName: "accepted_terms_version",
        required: false,
      },
      acceptedTermsAt: {
        type: "date",
        fieldName: "accepted_terms_at",
        required: false,
      },
      ipAddress: {
        type: "string",
        fieldName: "ip_address",
        required: false,
      },
    },
  },
  session: {
    modelName: "sessions",
    fields: {
      expiresAt: "expires_at",
      createdAt: "created_at",
      updatedAt: "updated_at",
      userId: "user_id",
      ipAddress: "ip_address",
      userAgent: "user_agent",
    },
  },
  account: {
    modelName: "accounts",
    fields: {
      accountId: "account_id",
      providerId: "provider_id",
      userId: "user_id",
      accessToken: "access_token",
      refreshToken: "refresh_token",
      idToken: "id_token",
      accessTokenExpiresAt: "access_token_expires_at",
      refreshTokenExpiresAt: "refresh_token_expires_at",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
  verification: {
    modelName: "verifications",
    fields: {
      expiresAt: "expires_at",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
  plugins: [
    {
      id: "terms-acceptance-tracker",
      hooks: {
        before: [
          {
            matcher: (ctx) => ctx.path === "/sign-up/email",
            handler: createAuthMiddleware(async (ctx) => {
              const request = ctx.request;
              let ip = request?.headers?.get("x-forwarded-for")?.split(",")[0] ||
                       request?.headers?.get("x-real-ip") ||
                       "127.0.0.1";
              
              if (ip === "::1" || ip === "::ffff:127.0.0.1") {
                ip = "127.0.0.1";
              }

              ctx.body = {
                ...(ctx.body || {}),
                acceptedTermsVersion: "v1.0",
                acceptedTermsAt: new Date(),
                ipAddress: ip,
              };
              return {
                context: ctx,
              };
            }),
          },
        ],
      },
    },
  ],
});
