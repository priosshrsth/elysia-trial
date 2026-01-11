import { RegisterSchema, VerificationSchema } from "@repo/types";
import Elysia from "elysia";
import { db } from "src/db";
import z from "zod";

export const RegisterRoute = new Elysia()
  .post(
    "/register",
    ({ body, status }) => {
      return status(200, body);
    },
    {
      body: RegisterSchema,
      response: RegisterSchema,
    },
  )
  .get(
    "/verification",
    async ({ status }) => {
      const data = await db.query.verification.findFirst();
      if (!data) {
        return status(404, {
          message: "Verification not found",
        });
      }
      return {
        ...data,
        expiresAt: data.expiresAt.toISOString(),
      };
    },
    {
      response: {
        200: VerificationSchema,
        404: z.object({
          message: z.string(),
        }),
      },
    },
  )
  .get("/hello/:id", (id) => `Hello ${id}`);
