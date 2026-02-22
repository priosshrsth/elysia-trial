/** Platform-owned secrets — created by the platform Terraform layer */
export const PLATFORM_SECRETS = ["DB_URL", "REDIS_URL"] as const;

/**
 * App secrets — SM containers created by apps/api Terraform layer, values set manually.
 * Keep in sync with secret_names in cicd/apps/api/infra/main.tf.
 */
export const APP_SECRETS = ["AUTH_SECRET", "COOKIE_KEY", "SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS"] as const;

/** All secrets mounted into Cloud Run at deploy time */
export const CLOUD_RUN_SECRETS = [...PLATFORM_SECRETS, ...APP_SECRETS] as const;
