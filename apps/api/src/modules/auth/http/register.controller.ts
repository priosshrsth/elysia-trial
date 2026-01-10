import { RegisterSchema } from "@repo/types";
import Elysia from "elysia";

export const RegisterRoute = new Elysia()
  .post(
    "/register",
    ({ body }) => {
      return body;
    },
    {
      body: RegisterSchema,
    },
  )
  .get("/hello/:id", ({ params: { id } }) => {
    return `Hello ${id}`;
  });
