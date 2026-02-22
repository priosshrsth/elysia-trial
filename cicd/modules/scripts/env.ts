/** biome-ignore-all lint/style/noProcessEnv: <allow process.env> */

export type Environment = "staging" | "production";

const VALID_ENVS = new Set<string>(["staging", "production"]);

export function resolveEnv(input: string | undefined): Environment {
  if (!(input && VALID_ENVS.has(input))) {
    console.error(`Invalid environment: "${input}". Must be one of: ${[...VALID_ENVS].join(", ")}`);
    process.exit(1);
  }
  return input as Environment;
}

export function requireEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(`Missing required environment variable: ${name}`);
    process.exit(1);
  }
  return value;
}

export function getProjectId(): string {
  return requireEnvVar("GCP_PROJECT_ID");
}

export const REGION = "us-central1";
