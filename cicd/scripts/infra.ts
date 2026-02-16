/** biome-ignore-all lint/style/noProcessEnv: <allow process.env> */

import { join } from "node:path";
import { $ } from "bun";
import { infraDir } from "./lib/paths";

const VALID_LAYERS = new Set(["platform", "api", "web"]);

const args = process.argv.slice(2);
const command = args[0]; // plan, apply, destroy
const layer = args[1]; // platform, api, web

if (!(command && ["plan", "apply", "destroy"].includes(command))) {
  console.error("Usage: bun run cicd/scripts/infra.ts <plan|apply|destroy> <platform|api|web>");
  process.exit(1);
}

if (!(layer && VALID_LAYERS.has(layer))) {
  console.error(`Invalid layer: "${layer}". Must be one of: ${[...VALID_LAYERS].join(", ")}`);
  process.exit(1);
}

const layerDir = join(infraDir, layer);
process.chdir(layerDir);

console.log(`Running terraform ${command} for layer: ${layer}`);

// Initialize (in case modules changed)
await $`terraform init -upgrade`.quiet();

const extraArgs = command === "plan" ? [] : ["-auto-approve"];

try {
  await $`terraform ${command} ${extraArgs}`;
} catch (error) {
  console.error(`Terraform ${command} failed for ${layer}:`, error);
  process.exit(1);
}
