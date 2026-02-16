import { dirname, join, resolve } from "node:path";

// robustly find the infra directory
const libDir = dirname(new URL(import.meta.url).pathname);
export const infraDir = resolve(libDir, "../../infra"); // cicd/infra from cicd/scripts/lib
export const envDir = join(infraDir, "environments");

export function getEnvPaths(environment: string) {
  const currentEnvDir = join(envDir, environment);
  return {
    dir: currentEnvDir,
    publicVarFile: join(currentEnvDir, "terraform.tfvars"),
    secretGpgFile: join(currentEnvDir, "secrets.tfvars.gpg"),
    secretVarFile: join(currentEnvDir, "secrets.tfvars"),
  };
}
