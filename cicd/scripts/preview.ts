/** biome-ignore-all lint/style/noProcessEnv: <allow process.env> */

import { $ } from "bun";
import { getProjectId, getRegion } from "./lib/env";

const args = process.argv.slice(2);
const action = args[0]; // "create" or "destroy"
const previewId = args[1];

if (!(action && ["create", "destroy"].includes(action))) {
  console.error("Usage: bun run cicd/scripts/preview.ts <create|destroy> <previewId>");
  process.exit(1);
}

if (!previewId) {
  console.error("Preview ID is required.");
  process.exit(1);
}

const PROJECT_ID = getProjectId();
const REGION = getRegion();
const ZONE = `${REGION}-c`;

if (action === "create") {
  console.log(`Creating preview environment: ${previewId}`);

  // Create preview database on shared VM
  console.log("\nCreating preview database...");
  await $`gcloud compute ssh servio-db \
    --zone ${ZONE} \
    --tunnel-through-iap \
    --project ${PROJECT_ID} \
    --command ${`docker exec postgres psql -U postgres -c 'CREATE DATABASE servio_preview_${previewId};'`}`.nothrow();

  console.log("\nPreview database created. Now deploy services:");
  console.log(`  bun run deploy:api preview ${previewId}`);
  console.log(`  bun run deploy:web preview ${previewId}`);
}

if (action === "destroy") {
  console.log(`Destroying preview environment: ${previewId}`);

  // Delete Cloud Run services
  console.log("\nDeleting Cloud Run services...");
  await $`gcloud run services delete api-preview-${previewId} \
    --region ${REGION} --project ${PROJECT_ID} --quiet`.nothrow();
  await $`gcloud run services delete web-preview-${previewId} \
    --region ${REGION} --project ${PROJECT_ID} --quiet`.nothrow();

  // Drop database
  console.log("\nDropping preview database...");
  await $`gcloud compute ssh servio-db \
    --zone ${ZONE} \
    --tunnel-through-iap \
    --project ${PROJECT_ID} \
    --command ${`docker exec postgres psql -U postgres -c 'DROP DATABASE IF EXISTS servio_preview_${previewId};'`}`.nothrow();

  // Clean up images
  console.log("\nCleaning up images...");
  const AR_REPO = `${REGION}-docker.pkg.dev/${PROJECT_ID}/servio`;
  await $`gcloud artifacts docker images delete ${AR_REPO}/api:api-preview-${previewId} --quiet`.nothrow();
  await $`gcloud artifacts docker images delete ${AR_REPO}/web:web-preview-${previewId} --quiet`.nothrow();

  console.log("\nPreview environment destroyed.");
}
