import z from "zod";

const env = z.object({
  DB_URL: z.string(),
  REDIS_URL: z.string(),
  AUTH_SECRET: z.string(), //openssl rand -base64 32
  COOKIE_KEY: z.string().optional(),
  NODE_ENV: z.enum(["development", "test", "staging", "production"]),
  PORT: z.coerce.number<string | number>().min(3000).default(3001),
  TRUSTED_DOMAINS: z.string().transform((data) =>
    data.split(",").flatMap((t) => {
      const trimmedValue = t.trim();
      if (!trimmedValue) {
        return [];
      }

      return [t];
    }),
  ),
});

let validatedEnv: z.output<typeof env>;

export function getValidateEnv() {
  if (validatedEnv) {
    return validatedEnv;
  }

  console.log("Validing env..");

  validatedEnv = env.parse(process.env);
  return validatedEnv;
}

export const appConfig = getValidateEnv();
