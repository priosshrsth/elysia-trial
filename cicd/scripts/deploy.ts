/** biome-ignore-all lint/style/noProcessEnv: <allow process.env> */

import { existsSync } from "node:fs";
import { $ } from "bun";
import { getEnvPaths, infraDir } from "./lib/paths";
import { cleanupSecretFile, decryptSecretFile } from "./lib/secrets";

// change working directory to infraDir
process.chdir(infraDir);

const args = process.argv.slice(2);
const command = args[0]; // plan, apply, destroy
const environment = args[1]; // prod, staging, preview
const branchName = args[2] || "";

if (!(command && environment)) {
  console.error("Usage: bun run deploy.ts <plan|apply|destroy> <prod|staging|preview> [branchName]");
  process.exit(1);
}

if (environment === "preview" && !branchName) {
  console.error("Error: branchName is required for preview environment");
  process.exit(1);
}

console.log(`Running terraform ${command} for environment: ${environment}`);

// Get paths
const commonEnv = getEnvPaths("common");
const currentEnv = getEnvPaths(environment);

// Decrypt secrets
let hasCommonSecrets = false;
let hasSecrets = false;

// Common secrets
if (await decryptSecretFile(commonEnv.secretGpgFile, commonEnv.secretVarFile)) {
  hasCommonSecrets = true;
}

// Env secrets
if (await decryptSecretFile(currentEnv.secretGpgFile, currentEnv.secretVarFile)) {
  hasSecrets = true;
}

// Construct var arguments
const varArgs = [`-var="environment=${environment}"`];

// Load common public vars
if (existsSync(commonEnv.publicVarFile)) {
  varArgs.push(`-var-file=${commonEnv.publicVarFile}`);
}

// Load common secrets
if (hasCommonSecrets) {
  varArgs.push(`-var-file=${commonEnv.secretVarFile}`);
}

// Load env public vars
if (existsSync(currentEnv.publicVarFile)) {
  varArgs.push(`-var-file=${currentEnv.publicVarFile}`);
}

// Load env secrets
if (hasSecrets) {
  varArgs.push(`-var-file=${currentEnv.secretVarFile}`);
}

if (environment === "preview") {
  varArgs.push(`-var="branch_name=${branchName}"`);
}

// Run terraform
try {
  await $`terraform ${command} ${varArgs}`;
} catch (error) {
  console.error("Terraform command failed:", error);
  process.exit(1);
} finally {
  // Cleanup
  if (hasCommonSecrets) {
    cleanupSecretFile(commonEnv.secretVarFile);
  }
  if (hasSecrets) {
    cleanupSecretFile(currentEnv.secretVarFile);
  }
}
