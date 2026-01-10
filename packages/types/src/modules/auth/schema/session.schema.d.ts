import { z } from "zod";
export declare const SessionSchema: z.ZodObject<
  {
    userId: z.ZodUUID;
    token: z.ZodString;
    maxAge: z.ZodISODateTime;
    expiresAt: z.ZodISODateTime;
  },
  z.core.$strip
>;
//# sourceMappingURL=session.schema.d.ts.map
