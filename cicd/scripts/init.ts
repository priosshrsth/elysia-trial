/** biome-ignore-all lint/style/noProcessEnv: <allow process.env> */

import { join } from "node:path";
import { $ } from "bun";
import { getProjectId, getRegion, requireEnvVar, resolveEnv } from "./lib/env";
import { infraDir } from "./lib/paths";

const args = process.argv.slice(2);
const env = resolveEnv(args[0]);

const PROJECT_ID = getProjectId();
const REGION = getRegion();
const BUCKET = `${PROJECT_ID}-terraform-state`;

console.log(`Bootstrapping infrastructure for project: ${PROJECT_ID} (env: ${env})\n`);

// 1. Create GCS bucket for Terraform state
console.log("1. Creating Terraform state bucket...");
await $`gcloud storage buckets create gs://${BUCKET} \
  --project=${PROJECT_ID} \
  --location=${REGION} \
  --uniform-bucket-level-access \
  --public-access-prevention`.nothrow();

await $`gcloud storage buckets update gs://${BUCKET} --versioning`;

// 2. Enable required APIs
console.log("\n2. Enabling GCP APIs...");
const apis = [
  "run.googleapis.com",
  "compute.googleapis.com",
  "artifactregistry.googleapis.com",
  "secretmanager.googleapis.com",
  "iam.googleapis.com",
  "iamcredentials.googleapis.com",
  "cloudresourcemanager.googleapis.com",
  "vpcaccess.googleapis.com",
  "sqladmin.googleapis.com",
  "redis.googleapis.com",
  "servicenetworking.googleapis.com",
];

for (const api of apis) {
  console.log(`Enabling API: ${api}...`);
  await $`gcloud services enable ${api} --project=${PROJECT_ID}`;
  console.log(`API ${api} enabled successfully`);
}

// 3. Create secrets in Secret Manager (idempotent — skips if already exists)
console.log("\n3. Creating secrets in Secret Manager...");

const platformSecrets = [{ name: "DB_PASSWORD", envVar: "DB_PASSWORD" }];

for (const { name, envVar } of platformSecrets) {
  const exists = (await $`gcloud secrets describe ${name} --project=${PROJECT_ID}`.nothrow()).exitCode === 0;

  if (exists) {
    const hasVersion =
      (await $`gcloud secrets versions describe latest --secret=${name} --project=${PROJECT_ID}`.nothrow()).exitCode ===
      0;

    if (hasVersion) {
      console.log(`  Secret ${name} already has a version, skipping...`);
      continue;
    }

    console.log(`  Secret ${name} exists but has no version, adding initial value...`);
    const value = requireEnvVar(envVar);
    await $`printf '%s' ${value} | gcloud secrets versions add ${name} --data-file=- --project=${PROJECT_ID}`;
  } else {
    console.log(`  Creating secret ${name}...`);
    const value = requireEnvVar(envVar);
    await $`printf '%s' ${value} | gcloud secrets create ${name} --data-file=- --replication-policy=automatic --project=${PROJECT_ID}`;
  }
}

// 4. Initialize all Terraform layers
const layers = ["platform", "api"];
for (const layer of layers) {
  console.log(`\n4. Initializing Terraform: ${layer}...`);
  process.chdir(join(infraDir, layer));
  await $`terraform init -backend-config="bucket=${BUCKET}"`;
}

console.log("\n--- Bootstrap complete ---");
console.log(`Project: ${PROJECT_ID} | Environment: ${env}`);
console.log("\nNext steps:");
console.log(`  1. mise run infra:plan -- platform ${env}`);
console.log(`  2. mise run infra:deploy -- platform ${env}`);
console.log(`  3. mise run infra:deploy -- api ${env}`);
