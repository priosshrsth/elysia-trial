import { join } from "node:path";
import { resolveEnv } from "../../modules/scripts/env";
import { cicdDir } from "../../modules/scripts/paths";
import { runTerraform } from "../../modules/scripts/terraform";

const args = process.argv.slice(2);
const cmdArg = args[0]; // plan, up, down
const envInput = args[1]; // staging, production

if (!(cmdArg && ["plan", "up", "down"].includes(cmdArg))) {
  console.error("Usage: bun run cicd/apps/api/index.ts <plan|up|down> <staging|production>");
  process.exit(1);
}

const commandMap: Record<string, "plan" | "apply" | "destroy"> = {
  plan: "plan",
  up: "apply",
  down: "destroy",
};

const env = resolveEnv(envInput);
const command = commandMap[cmdArg];
const layerDir = join(import.meta.dir, "infra");
const varFile = join(cicdDir, "envs", `${env}.tfvars`);

await runTerraform(command, layerDir, env, { varFile });
