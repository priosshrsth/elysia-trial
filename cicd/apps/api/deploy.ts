/** biome-ignore-all lint/style/noProcessEnv: <allow process.env> */

import { $ } from "bun";
import { getProjectId, REGION, resolveEnv } from "../../modules/scripts/env";

const args = process.argv.slice(2);
const env = resolveEnv(args[0]);
const imageTag = args[1];

if (!imageTag) {
  console.error("Usage: bun deploy.ts <staging|production> <image-tag>");
  process.exit(1);
}

const PROJECT_ID = getProjectId();

const serviceName = `api-${env}`;
const workerServiceName = `api-worker-${env}`;

console.log(`\nDeploying ${serviceName}...`);
await $`gcloud run deploy ${serviceName} \
  --image ${imageTag} \
  --project ${PROJECT_ID} \
  --region ${REGION} \
  --platform managed \
  --quiet`;

const describeResult =
  await $`gcloud run services describe ${serviceName} --project ${PROJECT_ID} --region ${REGION} --format ${"value(status.url)"}`.text();
const url = describeResult.trim();

console.log(`\nDeployed: ${url}`);

console.log(`\nDeploying ${workerServiceName}...`);
await $`gcloud run deploy ${workerServiceName} \
  --image ${imageTag} \
  --project ${PROJECT_ID} \
  --region ${REGION} \
  --platform managed \
  --quiet`;

console.log(`\nDeployed worker: ${workerServiceName}`);

const migrationJobName = `api-migration-${env}`;

console.log("\nUpdating migration job image...");
await $`gcloud run jobs update ${migrationJobName} \
  --image ${imageTag} \
  --project ${PROJECT_ID} \
  --region ${REGION} \
  --quiet`;

console.log("\nRunning migrations...");
await $`gcloud run jobs execute ${migrationJobName} \
  --project ${PROJECT_ID} \
  --region ${REGION} \
  --wait`;

console.log("\nMigrations complete.");
