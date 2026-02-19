/** biome-ignore-all lint/style/noProcessEnv: <allow process.env> */

import { join } from "node:path";
import { $ } from "bun";
import { getProjectId, getRegion, resolveEnv } from "./modules/scripts/env";
import { cicdDir } from "./modules/scripts/paths";

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

// 3. Initialize all Terraform layers
const layers = [
  { name: "platform", path: "platform" },
  { name: "api", path: "apps/api" },
];
for (const layer of layers) {
  console.log(`\n3. Initializing Terraform: ${layer.name}...`);
  process.chdir(join(cicdDir, layer.path, "infra"));
  await $`terraform init -backend-config="bucket=${BUCKET}"`;
}

console.log("\n--- Bootstrap complete ---");
console.log(`Project: ${PROJECT_ID} | Environment: ${env}`);
console.log("\nNext steps:");
console.log(`  1. mise run platform:plan -- ${env}`);
console.log(`  2. mise run platform:up -- ${env}`);
console.log(`  3. mise run api:up -- ${env}`);
