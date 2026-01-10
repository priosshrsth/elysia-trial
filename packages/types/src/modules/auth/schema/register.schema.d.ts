import z from "zod";
export declare const RegisterSchema: z.ZodObject<
  {
    email: z.ZodEmail;
    password: z.ZodString;
    name: z.ZodString;
  },
  z.core.$strip
>;
//# sourceMappingURL=register.schema.d.ts.map
