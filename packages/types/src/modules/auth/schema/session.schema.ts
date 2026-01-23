import { z } from "zod";

export const SessionSchema = z.object({
  userId: z.uuidv4(),
  token: z.string(),
  maxAge: z.iso.datetime(),
  expiresAt: z.iso.datetime(),
});
