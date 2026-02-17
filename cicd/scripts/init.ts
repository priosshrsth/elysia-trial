/** biome-ignore-all lint/style/noProcessEnv: <allow process.env> */

import { join } from "node:path";
import { $ } from "bun";
import { getProjectId, getRegion } from "./lib/env";
import { infraDir } from "./lib/paths";

const PROJECT_ID = getProjectId();
const REGION = getRegion();
const BUCKET = `${PROJECT_ID}-terraform-state`;

console.log(`Bootstrapping infrastructure for project: ${PROJECT_ID}\n`);

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
  "billingbudgets.googleapis.com",
  "vpcaccess.googleapis.com",
];

for (const api of apis) {
  console.log(`Enabling API: ${api}...`);
  await $`gcloud services enable ${api} --project=${PROJECT_ID}`;
  console.log(`API ${api} enabled successfully`);
}

// 3. Initialize all Terraform layers
const layers = ["platform", "api", "web"];
for (const layer of layers) {
  console.log(`\n3. Initializing Terraform: ${layer}...`);
  process.chdir(join(infraDir, layer));
  await $`terraform init -backend-config="bucket=${BUCKET}"`;
}

console.log("\n--- Bootstrap complete ---");
console.log("Next steps:");
console.log("  1. Set TF_VAR_* environment variables");
console.log("  2. mise run infra:plan -- platform");
console.log("  3. mise run infra:deploy -- platform");
console.log("  4. mise run infra:deploy -- api");
console.log("  5. mise run infra:deploy -- web");
