import Elysia from "elysia";
import { auth } from "./auth";

export const authApp = new Elysia()
  .mount("/api", auth.handler)
  .macro({
    auth: {
      async resolve({ status, request: { headers } }) {
        const session = await auth.api.getSession({
          headers,
        });

        if (!session?.user) {
          return status(401);
        }

        return {
          user: session?.user,
          session: session?.session,
        };
      },
    },
  })
  .get("/user", ({ user }) => user, {
    auth: true,
  });
