import z from "zod";

const nodeEnv = process.env.NODE_ENV as string;

export const isDevelopment = new Set(["development", "test", "local"]).has(nodeEnv);

const env = z.object({
  NODE_ENV: z.enum(["development", "test", "staging", "production"]),
  PORT: z.coerce.number<string | number>().min(3000).default(3001),

  // db
  DB_URL: z.string(),
  REDIS_URL: z.string(),

  // auth
  AUTH_SECRET: z.string(), //openssl rand -base64 32
  COOKIE_KEY: z.string().optional(),
  BETTER_AUTH_BASE_URL: z.url(),
  TRUSTED_DOMAINS: z.string().transform((data) =>
    data.split(",").flatMap((t) => {
      const trimmedValue = t.trim();
      if (!trimmedValue) {
        return [];
      }

      return [t];
    }),
  ),

  // smtp
  SMTP_HOST: z.string(),
  SMTP_PORT: z.coerce.number(),
  SMTP_USER: isDevelopment ? z.string().optional() : z.string(),
  SMTP_PASS: isDevelopment ? z.string().optional() : z.string(),
  EMAIL_FROM: z.string().default("noreply@servio.dev"),
});

let validatedEnv: z.output<typeof env>;

export function getValidateEnv() {
  if (validatedEnv) {
    return validatedEnv;
  }

  console.log("Validating env..");

  validatedEnv = env.parse(process.env);
  return validatedEnv;
}

export const appConfig = { ...process.env } as unknown as z.output<typeof env>;
