import Elysia from "elysia";
import { auth } from "src/modules/auth/lib/auth";

export const authMacro = new Elysia().macro({
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
});
