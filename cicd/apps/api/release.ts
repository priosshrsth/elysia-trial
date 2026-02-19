/** biome-ignore-all lint/style/noProcessEnv: <allow process.env> */

import { $ } from "bun";
import { getProjectId, getRegion, resolveEnv } from "../../modules/scripts/env";
import { rootDir } from "../../modules/scripts/paths";

const args = process.argv.slice(2);
const env = resolveEnv(args[0]);

const PROJECT_ID = getProjectId();
const REGION = getRegion();
const AR_REPO = `${REGION}-docker.pkg.dev/${PROJECT_ID}/servio`;
const serviceName = `api-${env}`;
const imageTag = `${AR_REPO}/api:${env}-latest`;

process.chdir(rootDir);

// Configure Docker for Artifact Registry
console.log("Configuring Docker auth...");
await $`gcloud auth configure-docker ${REGION}-docker.pkg.dev --quiet`;

// Build
console.log(`\nBuilding api for ${env}...`);
await $`docker build -f apps/api/Dockerfile -t ${imageTag} .`;

// Push
console.log("\nPushing image...");
await $`docker push ${imageTag}`;

const secretNames = [
  "DB_URL",
  "REDIS_URL",
  "AUTH_SECRET",
  "COOKIE_KEY",
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_USER",
  "SMTP_PASS",
];
const secretsArg = secretNames.map((s) => `${s}=${s}:latest`).join(",");
const envVarsArg = "NODE_ENV=production,PORT=3001";

// Deploy to Cloud Run
console.log(`\nDeploying ${serviceName} to Cloud Run...`);
await $`gcloud run deploy ${serviceName} \
  --image ${imageTag} \
  --update-secrets ${secretsArg} \
  --set-env-vars ${envVarsArg} \
  --region ${REGION} \
  --project ${PROJECT_ID} \
  --platform managed \
  --allow-unauthenticated \
  --quiet`;

// Get URL
const result = await $`gcloud run services describe ${serviceName} \
  --region ${REGION} \
  --project ${PROJECT_ID} \
  --format value(status.url)`.text();

console.log(`\nDeployed: ${result.trim()}`);
