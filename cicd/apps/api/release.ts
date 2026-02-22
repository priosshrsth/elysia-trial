/** biome-ignore-all lint/style/noProcessEnv: <allow process.env> */

import { join } from "node:path";
import { $ } from "bun";
import { requireEnvVar, resolveEnv } from "../../modules/scripts/env";
import { rootDir } from "../../modules/scripts/paths";

const args = process.argv.slice(2);
const env = resolveEnv(args[0]);

const AR_REPO = requireEnvVar("AR_REGISTRY_URL");
const dockerHost = AR_REPO.split("/")[0];
const imageTag = `${AR_REPO}/api:${env}-latest`;

process.chdir(rootDir);

// Configure Docker for Artifact Registry
console.log("Configuring Docker auth...");
await $`gcloud auth configure-docker ${dockerHost} --quiet`;

// Build
console.log(`\nBuilding api for ${env}...`);
await $`docker build --platform linux/amd64 -f apps/api/Dockerfile -t ${imageTag} .`;

// Push
console.log("\nPushing image...");
await $`docker push ${imageTag}`;

// Deploy
await $`bun ${join(import.meta.dir, "deploy.ts")} ${env} ${imageTag}`;
