import z from "zod";
import { DateTimeSchema } from "../../common/date.shema";
import { VerificationType } from "../const/auth.const";

export const VerificationSchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: z.enum(VerificationType),
  code: z.string(),
  expiresAt: DateTimeSchema,
});
