/** biome-ignore-all lint/style/noProcessEnv: <allow process.env> */

import { $ } from "bun";
import { getProjectId, getRegion, resolveEnv } from "./lib/env";
import { rootDir } from "./lib/paths";

const args = process.argv.slice(2);
const app = args[0]; // "api" or "web"
const env = resolveEnv(args[1]);
const previewId = args[2] || "";

if (!(app && ["api", "web"].includes(app))) {
  console.error("Usage: bun run cicd/scripts/build-and-deploy.ts <api|web> <prod|staging|preview> [previewId]");
  process.exit(1);
}

if (env === "preview" && !previewId) {
  console.error("Preview deployments require a preview ID: bun run deploy:api preview <id>");
  process.exit(1);
}

const PROJECT_ID = getProjectId();
const REGION = getRegion();
const AR_REPO = `${REGION}-docker.pkg.dev/${PROJECT_ID}/elysia`;
const serviceName = env === "preview" ? `${app}-preview-${previewId}` : `${app}-${env}`;
const imageTag = `${AR_REPO}/${app}:${serviceName}`;

process.chdir(rootDir);

// Configure Docker for Artifact Registry
console.log("Configuring Docker auth...");
await $`gcloud auth configure-docker ${REGION}-docker.pkg.dev --quiet`;

// Build
console.log(`\nBuilding ${app} for ${env}...`);
await $`docker build -f apps/${app}/Dockerfile -t ${imageTag} .`;

// Push
console.log("\nPushing image...");
await $`docker push ${imageTag}`;

// Deploy to Cloud Run
console.log(`\nDeploying ${serviceName} to Cloud Run...`);
await $`gcloud run deploy ${serviceName} \
  --image ${imageTag} \
  --region ${REGION} \
  --platform managed \
  --allow-unauthenticated \
  --quiet`;

// Get URL
const result = await $`gcloud run services describe ${serviceName} \
  --region ${REGION} \
  --format value(status.url)`.text();

console.log(`\nDeployed: ${result.trim()}`);
