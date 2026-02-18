/** biome-ignore-all lint/style/noProcessEnv: <allow process.env> */

import { join } from "node:path";
import { $ } from "bun";
import { getProjectId, resolveEnv } from "./lib/env";
import { infraDir } from "./lib/paths";

const VALID_LAYERS = new Set(["platform", "api"]);

const args = process.argv.slice(2);
const command = args[0]; // plan, apply, destroy
const layer = args[1]; // platform, api
const envInput = args[2]; // staging, production

if (!(command && ["plan", "apply", "destroy"].includes(command))) {
  console.error("Usage: bun run cicd/scripts/infra.ts <plan|apply|destroy> <platform|api> <staging|production>");
  process.exit(1);
}

if (!(layer && VALID_LAYERS.has(layer))) {
  console.error(`Invalid layer: "${layer}". Must be one of: ${[...VALID_LAYERS].join(", ")}`);
  process.exit(1);
}

const env = resolveEnv(envInput);
const projectId = getProjectId();

// Set shared TF_VAR_ values from script context
process.env.TF_VAR_project_id = projectId;
process.env.TF_VAR_environment = env;

const layerDir = join(infraDir, layer);
const stateBucket = `${projectId}-terraform-state`;

process.chdir(layerDir);

console.log(`Running terraform ${command} for layer: ${layer} (env: ${env}, project: ${projectId})`);

// Initialize with backend config pointing to this project's state bucket
await $`terraform init -upgrade -backend-config="bucket=${stateBucket}"`.quiet();

const extraArgs = command === "plan" ? [] : ["-auto-approve"];

// Only platform uses a tfvars file (env-specific settings like use_managed_db, budget_amount, etc.)
// Secrets (billing_account, db_password) are read from Secret Manager via data sources in main.tf
// API layer gets all it needs from TF_VAR_ env vars set by this script
const varFileArgs = layer === "platform" ? ["-var-file", join(infraDir, "envs", `${env}.tfvars`)] : [];

try {
  await $`terraform ${command} ${varFileArgs} ${extraArgs}`;
} catch (error) {
  console.error(`Terraform ${command} failed for ${layer}:`, error);
  process.exit(1);
}
