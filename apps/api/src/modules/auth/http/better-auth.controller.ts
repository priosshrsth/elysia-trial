import Elysia from "elysia";
import { auth } from "src/modules/auth/lib/auth";
import z from "zod";

const BetterAuthErrorResponseSchema = z.object({ message: z.string(), code: z.string() });
const genericResponses = {
  400: BetterAuthErrorResponseSchema,
  401: BetterAuthErrorResponseSchema,
  403: BetterAuthErrorResponseSchema,
  404: BetterAuthErrorResponseSchema,
  429: BetterAuthErrorResponseSchema,
  500: BetterAuthErrorResponseSchema,
};

export const FakeBetterAuthController = new Elysia({ name: "better-auth.controller", detail: { hide: true } })
  // /sign-in/social (POST)
  .post("/sign-in/social", () => "" as unknown as ReturnType<typeof auth.api.signInSocial>, {
    body: auth.api.signInSocial.options?.body,
    response: {
      200: z.any() as unknown as z.ZodType<Awaited<ReturnType<typeof auth.api.signInSocial>>>,
      ...genericResponses,
    },
  })

  // /get-session (GET)
  .get("/get-session", () => "" as unknown as ReturnType<typeof auth.api.getSession>, {
    response: {
      200: z.any() as unknown as z.ZodType<Awaited<ReturnType<typeof auth.api.getSession>>>,
      ...genericResponses,
    },
  })

  // /sign-out (POST)
  .post("/sign-out", () => "" as unknown as ReturnType<typeof auth.api.signOut>, {
    body: z.void(),
    response: {
      200: z.any() as unknown as z.ZodType<Awaited<ReturnType<typeof auth.api.signOut>>>,
      ...genericResponses,
    },
  })

  // /sign-up/email (POST)
  .post("/sign-up/email", () => "" as unknown as ReturnType<typeof auth.api.signUpEmail>, {
    body: auth.api.signUpEmail.options?.body,
    response: {
      200: z.any() as unknown as z.ZodType<Awaited<ReturnType<typeof auth.api.signUpEmail>>>,
      ...genericResponses,
    },
  })

  // /sign-in/email (POST)
  .post("/sign-in/email", () => "" as unknown as ReturnType<typeof auth.api.signInEmail>, {
    body: auth.api.signInEmail.options?.body,
    response: {
      200: z.any() as unknown as z.ZodType<Awaited<ReturnType<typeof auth.api.signInEmail>>>,
      ...genericResponses,
    },
  })

  // /reset-password (POST)
  .post("/reset-password", () => "" as unknown as ReturnType<typeof auth.api.resetPassword>, {
    body: auth.api.resetPassword.options?.body,
    response: {
      200: z.any() as unknown as z.ZodType<Awaited<ReturnType<typeof auth.api.resetPassword>>>,
      ...genericResponses,
    },
  })

  // /verify-password (POST)
  .post("/verify-password", () => "" as unknown as ReturnType<typeof auth.api.verifyPassword>, {
    body: auth.api.verifyPassword.options?.body,
    response: {
      200: z.any() as unknown as z.ZodType<Awaited<ReturnType<typeof auth.api.verifyPassword>>>,
      ...genericResponses,
    },
  })

  // /verify-email (GET)
  .get("/verify-email", () => "" as unknown as ReturnType<typeof auth.api.verifyEmail>, {
    response: {
      200: z.any() as unknown as z.ZodType<Awaited<ReturnType<typeof auth.api.verifyEmail>>>,
      ...genericResponses,
    },
  })

  // /send-verification-email (POST)
  .post("/send-verification-email", () => "" as unknown as ReturnType<typeof auth.api.sendVerificationEmail>, {
    body: auth.api.sendVerificationEmail.options?.body,
    response: {
      200: z.any() as unknown as z.ZodType<Awaited<ReturnType<typeof auth.api.sendVerificationEmail>>>,
      ...genericResponses,
    },
  })

  // /change-email (POST)
  .post("/change-email", () => "" as unknown as ReturnType<typeof auth.api.changeEmail>, {
    body: auth.api.changeEmail.options?.body,
    response: {
      200: z.any() as unknown as z.ZodType<Awaited<ReturnType<typeof auth.api.changeEmail>>>,
      ...genericResponses,
    },
  })

  // /change-password (POST)
  .post("/change-password", () => "" as unknown as ReturnType<typeof auth.api.changePassword>, {
    body: auth.api.changePassword.options?.body,
    response: {
      200: z.any() as unknown as z.ZodType<Awaited<ReturnType<typeof auth.api.changePassword>>>,
      ...genericResponses,
    },
  })

  // /update-user (POST)
  .post("/update-user", () => "" as unknown as ReturnType<typeof auth.api.updateUser>, {
    body: auth.api.updateUser.options?.body,
    response: {
      200: z.any() as unknown as z.ZodType<Awaited<ReturnType<typeof auth.api.updateUser>>>,
      ...genericResponses,
    },
  })

  // /delete-user (POST)
  .post("/delete-user", () => "" as unknown as ReturnType<typeof auth.api.deleteUser>, {
    body: auth.api.deleteUser.options?.body,
    response: {
      200: z.any() as unknown as z.ZodType<Awaited<ReturnType<typeof auth.api.deleteUser>>>,
      ...genericResponses,
    },
  })

  // /request-password-reset (POST)
  .post("/request-password-reset", () => "" as unknown as ReturnType<typeof auth.api.requestPasswordReset>, {
    body: auth.api.requestPasswordReset.options?.body,
    response: {
      200: z.any() as unknown as z.ZodType<Awaited<ReturnType<typeof auth.api.requestPasswordReset>>>,
      ...genericResponses,
    },
  })

  // /reset-password/:token (GET)  (screenshot shows /reset-password/{token})
  .get("/reset-password/:token", () => "" as unknown as ReturnType<typeof auth.api.requestPasswordResetCallback>, {
    body: z.void(),
    query: auth.api.requestPasswordResetCallback.options.query,
    params: z.object({
      token: z.string(),
    }),
    response: {
      200: z.any() as unknown as z.ZodType<Awaited<ReturnType<typeof auth.api.resetPassword>>>,
      ...genericResponses,
    },
  })

  // /list-sessions (GET)
  .get("/list-sessions", () => "" as unknown as ReturnType<typeof auth.api.listSessions>, {
    response: {
      200: z.any() as unknown as z.ZodType<Awaited<ReturnType<typeof auth.api.listSessions>>>,
      ...genericResponses,
    },
  })

  // /revoke-session (POST)
  .post("/revoke-session", () => "" as unknown as ReturnType<typeof auth.api.revokeSession>, {
    body: auth.api.revokeSession.options?.body,
    response: {
      200: z.any() as unknown as z.ZodType<Awaited<ReturnType<typeof auth.api.revokeSession>>>,
      ...genericResponses,
    },
  })

  // /revoke-sessions (POST)
  .post("/revoke-sessions", () => "" as unknown as ReturnType<typeof auth.api.revokeSessions>, {
    body: z.void(),
    response: {
      200: z.any() as unknown as z.ZodType<Awaited<ReturnType<typeof auth.api.revokeSessions>>>,
      ...genericResponses,
    },
  })

  // /revoke-other-sessions (POST)
  .post("/revoke-other-sessions", () => "" as unknown as ReturnType<typeof auth.api.revokeOtherSessions>, {
    body: z.void(),
    response: {
      200: z.any() as unknown as z.ZodType<Awaited<ReturnType<typeof auth.api.revokeOtherSessions>>>,
      ...genericResponses,
    },
  })

  // /link-social (POST)
  .post("/link-social", () => "" as unknown as ReturnType<typeof auth.api.linkSocialAccount>, {
    body: auth.api.linkSocialAccount.options.body,
    response: {
      200: z.any() as unknown as z.ZodType<Awaited<ReturnType<typeof auth.api.linkSocialAccount>>>,
      ...genericResponses,
    },
  })

  // /list-accounts (GET)
  .get("/list-accounts", () => "" as unknown as ReturnType<typeof auth.api.listUserAccounts>, {
    response: {
      200: z.any() as unknown as z.ZodType<Awaited<ReturnType<typeof auth.api.listUserAccounts>>>,
      ...genericResponses,
    },
  })

  // /delete-user/callback (GET)
  .get("/delete-user/callback", () => "" as unknown as ReturnType<typeof auth.api.deleteUserCallback>, {
    response: {
      200: z.any() as unknown as z.ZodType<Awaited<ReturnType<typeof auth.api.deleteUserCallback>>>,
      ...genericResponses,
    },
  })

  // /unlink-account (POST)
  .post("/unlink-account", () => "" as unknown as ReturnType<typeof auth.api.unlinkAccount>, {
    body: auth.api.unlinkAccount.options?.body,
    response: {
      200: z.any() as unknown as z.ZodType<Awaited<ReturnType<typeof auth.api.unlinkAccount>>>,
      ...genericResponses,
    },
  })

  // /refresh-token (POST)
  .post("/refresh-token", () => "" as unknown as ReturnType<typeof auth.api.refreshToken>, {
    body: auth.api.refreshToken.options?.body,
    response: {
      200: z.any() as unknown as z.ZodType<Awaited<ReturnType<typeof auth.api.refreshToken>>>,
      ...genericResponses,
    },
  })

  // /get-access-token (POST)  (screenshot shows POST)
  .post("/get-access-token", () => "" as unknown as ReturnType<typeof auth.api.getAccessToken>, {
    body: auth.api.getAccessToken.options?.body,
    response: {
      200: z.any() as unknown as z.ZodType<Awaited<ReturnType<typeof auth.api.getAccessToken>>>,
      ...genericResponses,
    },
  })

  // /ok (GET)
  .get("/ok", () => "" as unknown as ReturnType<typeof auth.api.ok>, {
    response: {
      200: z.any() as unknown as z.ZodType<Awaited<ReturnType<typeof auth.api.ok>>>,
      ...genericResponses,
    },
  })

  // /error (GET)
  .get("/error", () => "" as unknown as ReturnType<typeof auth.api.error>, {
    response: {
      200: z.any() as unknown as z.ZodType<Awaited<ReturnType<typeof auth.api.error>>>,
      ...genericResponses,
    },
  });

export const BetterAuthController = new Elysia({
  detail: {
    hide: true,
  },
  prefix: "/api/v1/auth",
}).use(new Elysia() as unknown as typeof FakeBetterAuthController);

export type IBetterAuthController = typeof BetterAuthController;
