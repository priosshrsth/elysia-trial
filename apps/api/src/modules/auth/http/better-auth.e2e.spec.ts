import { describe, expect, it } from "bun:test";
import { treaty } from "@elysiajs/eden";
import { faker } from "@faker-js/faker";
import { eq } from "drizzle-orm";
import { db } from "src/db";
import { user } from "src/db/schema";
import { BetterAuthController } from "./better-auth.controller";

const validPassword = faker.internet.password({
  length: 12,
  pattern: /[A-Za-z0-9!@#$%^&*]/,
});

describe("Better Auth Integration", () => {
  const client = treaty(BetterAuthController, {
    fetch: {
      credentials: "include",
      mode: "cors",
    },
  });

  let sessionCookie: string | undefined;

  describe("Registration", () => {
    it("auth:register-invalid-data", async () => {
      const response = await client.api.v1.auth["sign-up"].email.post({
        email: "",
        name: "",
        password: "",
      });
      expect(response.status).toBe(400);
      expect(response.error?.value).toContainKey("code");
      if (response.error?.value && "code" in response.error.value) {
        expect(response.error?.value?.code).toBe("VALIDATION_ERROR");
      }
    });

    it("auth:register-with-valid-data", async () => {
      const response = await client.api.v1.auth["sign-up"].email.post({
        email: "jane@example.com",
        password: validPassword,
        name: "Jane Doe",
      });
      expect(response.status).toBe(200);
      expect(response.data?.user?.email).toBe("jane@example.com");
    });
  });

  describe("Sign In", () => {
    it("auth:sign-in-email-unverified", async () => {
      const response = await client.api.v1.auth["sign-in"].email.post({
        email: "jane@example.com",
        password: validPassword,
      });
      // Better auth might allow sign in even if unverified, depending on config.
      // But typically it returns session and user.
      expect(response.status).toBe(403);
    });

    it("auth:sign-in-email-verified", async () => {
      // Manually set email as verified in DB
      await db.update(user).set({ emailVerified: true }).where(eq(user.email, "jane@example.com"));

      const response = await client.api.v1.auth["sign-in"].email.post({
        email: "jane@example.com",
        password: validPassword,
      });

      const headers = response.headers as HeadersInit;
      expect(headers).not.toBeUndefined();
      const header = new Headers(headers);

      sessionCookie = header.get("set-cookie") || "";

      expect(response.status).toBe(200);
      if (response.data && "user" in response.data) {
        expect(response.data.user.emailVerified).toBe(true);
      }
    });
  });

  describe("Session Management", () => {
    it("auth:get-session", async () => {
      const response = await client.api.v1.auth["get-session"].get({
        headers: {
          cookie: sessionCookie ?? "",
        },
      });
      expect(response.status).toBe(200);
      expect(response.data).not.toBeNull();
      expect(response.data?.user.email).toBe("jane@example.com");
    });

    // it("auth:list-sessions", async () => {
    //   const response = await client.api.v1.auth["list-sessions"].get();
    //   expect(response.status).toBe(200);
    //   expect(Array.isArray(response.data)).toBe(true);
    //   expect(response.data?.length).toBeGreaterThan(0);
    // });

    // it("auth:sign-out", async () => {
    //   const response = await client.api.v1.auth["sign-out"].post();
    //   expect(response.status).toBe(200);

    //   const sessionResponse = await client.api.v1.auth["get-session"].get();
    //   expect(sessionResponse.data).toBeNull();
    // });
  });

  // describe("User Management", () => {
  //   beforeEach(async () => {
  //     // Sign in before each test in this block
  //     await client.api.v1.auth["sign-in"].email.post({
  //       email: "jane@example.com",
  //       password: validPassword,
  //     });
  //   });

  //   it("auth:update-user-name", async () => {
  //     const response = await client.api.v1.auth["update-user"].post({
  //       name: "Jane Updated",
  //     });
  //     expect(response.status).toBe(200);

  //     const sessionResponse = await client.api.v1.auth["get-session"].get();
  //     if (sessionResponse.data && "user" in sessionResponse.data) {
  //       expect(sessionResponse.data.user.name).toBe("Jane Updated");
  //     }
  //   });

  //   it("auth:change-password", async () => {
  //     const response = await client.api.v1.auth["change-password"].post({
  //       newPassword: validPassword,
  //       currentPassword: validPassword,
  //     });
  //     expect(response.status).toBe(200);

  //     // Verify we can sign in with new password
  //     const signInResponse = await client.api.v1.auth["sign-in"].email.post({
  //       email: "jane@example.com",
  //       password: validPassword,
  //     });
  //     expect(signInResponse.status).toBe(200);
  //   });
  // });
});
