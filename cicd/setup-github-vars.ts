/** biome-ignore-all lint/style/noProcessEnv: <allow process.env> */

/**
 * Reads platform Terraform outputs for a given environment and sets the
 * corresponding GitHub Actions repository variables via the gh CLI.
 *
 * Run after `mise run platform:up -- <env>`:
 *   GCP_PROJECT_ID=<id> bun cicd/setup-github-vars.ts <staging|production>
 */

import { join } from "node:path";
import { $ } from "bun";
import { getProjectId, resolveEnv } from "./modules/scripts/env";
import { cicdDir } from "./modules/scripts/paths";

const args = process.argv.slice(2);
const env = resolveEnv(args[0]);
const suffix = env.toUpperCase();

const projectId = getProjectId();
const layerDir = join(cicdDir, "platform", "infra");
const stateBucket = `${projectId}-terraform-state`;

process.env.TF_VAR_project_id = projectId;
process.env.TF_VAR_environment = env;
process.chdir(layerDir);

console.log(`Reading Terraform outputs for ${env} (project: ${projectId})...\n`);
await $`terraform init -upgrade -backend-config="bucket=${stateBucket}"`.quiet();

const outputsRaw = await $`terraform output -json`.text();
const outputs = JSON.parse(outputsRaw) as Record<string, { value: string }>;

const vars: Record<string, string> = {
  [`GCP_PROJECT_ID_${suffix}`]: projectId,
  [`WIF_PROVIDER_${suffix}`]: outputs.wif_provider.value,
  [`GCP_SA_EMAIL_${suffix}`]: outputs.github_actions_sa_email.value,
  [`AR_REGISTRY_URL_${suffix}`]: outputs.artifact_registry_url.value,
};

console.log(`Setting GitHub repo variables for ${env}:`);
for (const [name, value] of Object.entries(vars)) {
  console.log(`  ${name} = ${value}`);
  await $`gh variable set ${name} --body ${value}`;
}

console.log(`\nDone. GitHub Actions is now configured to deploy to ${env}.`);
