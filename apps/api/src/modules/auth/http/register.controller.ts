import { RegisterSchema } from "@repo/types";
import Elysia from "elysia";
import { db } from "src/db";

export const RegisterRoute = new Elysia()
  .post(
    "/register",
    ({ body, status }) => {
      return status(200, body);
    },
    {
      body: RegisterSchema,
      // response: RegisterSchema,
    },
  )
  .get("/verification", async ({ status }) => {
    const data = await db.query.verification.findFirst();
    if (!data) {
      return status(404, {
        message: "Verification not found",
      });
    }
    return {
      id: data.id,
      userId: data.userId,
      code: data.code,
      createdAt: data.createdAt.toISOString(),
      updatedAt: data.updatedAt.toISOString(),
      expiresAt: data.expiresAt.toISOString(),
    };
  })
  .get("/hello/:id", (id) => `Hello ${id}`);
