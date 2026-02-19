/** biome-ignore-all lint/style/noProcessEnv: <allow process.env> */

import { join } from "node:path";
import { $ } from "bun";
import { getProjectId, resolveEnv } from "./modules/scripts/env";

const args = process.argv.slice(2);
const env = resolveEnv(args[0]);

const PROJECT_ID = getProjectId();
const cicdDir = import.meta.dir;

console.log(`\nDeploying ${env} → project: ${PROJECT_ID}\n`);

// ── 1. Platform (VPC, DB, Redis, IAM, Artifact Registry) ─────────────────────
console.log("1. Applying platform infrastructure...");
await $`bun run ${join(cicdDir, "platform/index.ts")} up ${env}`;

// ── 2. API infrastructure (Cloud Run service + secret containers) ─────────────
console.log("\n2. Applying API infrastructure...");
await $`bun run ${join(cicdDir, "apps/api/index.ts")} up ${env}`;

// ── 3. Build and deploy API image ─────────────────────────────────────────────
console.log("\n3. Building and deploying API...");
await $`bun run ${join(cicdDir, "apps/api/release.ts")} ${env}`;

console.log(`\nDeployment to ${env} complete.`);
