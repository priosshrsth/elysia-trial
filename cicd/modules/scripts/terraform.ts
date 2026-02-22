/** biome-ignore-all lint/style/noProcessEnv: <allow process.env> */

import { $ } from "bun";
import { getProjectId } from "./env";

export async function runTerraform(
  command: "plan" | "apply" | "destroy",
  layerDir: string,
  env: string,
  options?: { varFile?: string }
) {
  const projectId = getProjectId();
  const stateBucket = `${projectId}-terraform-state`;

  process.env.TF_VAR_project_id = projectId;
  process.env.TF_VAR_environment = env;

  process.chdir(layerDir);

  console.log(`Running terraform ${command} (env: ${env}, project: ${projectId})`);

  await $`terraform init -upgrade -backend-config="bucket=${stateBucket}"`.quiet();

  const varFileArgs = options?.varFile ? ["-var-file", options.varFile] : [];
  const extraArgs = command === "plan" ? [] : ["-auto-approve"];

  try {
    await $`terraform ${command} ${varFileArgs} ${extraArgs}`;
  } catch (error) {
    console.error(`Terraform ${command} failed:`, error);
    process.exit(1);
  }
}
