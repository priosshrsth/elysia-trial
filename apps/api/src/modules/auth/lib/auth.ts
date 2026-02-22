import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { betterAuth } from "better-auth/minimal";
import { openAPI } from "better-auth/plugins";
import { appConfig, getValidateEnv } from "src/config/app.config";
import { db } from "src/db";
import { redis } from "src/lib/redis";
import { emailService } from "src/modules/emails/email.service";
import { EmailTemplate } from "types";
import { v4 as uuidv4 } from "uuid";

export const auth = betterAuth({
  secret: appConfig.AUTH_SECRET,
  baseURL: appConfig.BETTER_AUTH_BASE_URL,
  database: drizzleAdapter(db, {
    provider: "pg",
    debugLogs: false,
  }),
  disabledPaths: ["/account-info"],
  emailVerification: {
    autoSignInAfterVerification: true,
    sendVerificationEmail(data, _request) {
      return emailService.enqueue({
        to: data.user.email,
        subject: "Verify your email address",
        template: EmailTemplate.WELCOME,
        props: {
          name: data.user.name,
          verificationUrl: data.url,
        },
      });
    },
    sendOnSignUp: true,
  },
  secondaryStorage: {
    get: async (key) => await redis.get(key),
    set: async (key, value, ttl) => await redis.set(key, value, "EX", `${ttl ?? ""}`),
    delete: async (key) => {
      await redis.del(key);
    },
  },
  session: {
    // expiresIn: 60 * 60 * 24 * 7, // 7 days - controls session_token expiration
    // updateAge: 60 * 60 * 24, // 1 day - when to refresh session_token
    cookieCache: {
      version: "1",
      enabled: true,
      maxAge: 15 * 60, // 15 minutes (short lived cookie)
      refreshCache: false,
    },
  },
  account: {
    storeStateStrategy: "cookie",
    storeAccountCookie: true, // Store account data after OAuth flow in a cookie (useful for database-less flows)
  },
  advanced: {
    cookiePrefix: appConfig.COOKIE_KEY,
    database: {
      generateId: () => uuidv4(),
    },
    // crossSubDomainCookies: {
    //   enabled: true,
    //   domain: "localhost:3001",
    // },
    // defaultCors: {
    //   origin: appConfig.TRUSTED_DOMAINS,
    //   headers: ["Content-Type", "Authorization", "set-auth-token"],
    //   credentials: true,
    // },
  },
  trustedOrigins: getValidateEnv().TRUSTED_DOMAINS,
  experimental: {
    joins: true,
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url, token }, _request) => {
      // void sendEmail({
      //   to: user.email,
      //   subject: "Reset your password",
      //   text: `Click the link to reset your password: ${url}`,
      // });
      console.log({
        user,
        url,
        token,
      });

      return Promise.resolve();
    },
  },

  basePath: "/auth",
  plugins: [openAPI()],
  telemetry: {
    // enabled: true,
    // debug: true,
  },
  user: {
    deleteUser: {
      enabled: true,
      afterDelete: async (user) => {
        const key = `active-sessions-${user.id}`;
        const listRaw = await redis.get(key);
        if (!listRaw) return;
        const list = JSON.parse(listRaw);
        for (const session of list) {
          await redis.del(session.token);
        }
        await redis.del(key);
      },
    },
  },
});
