import { join } from "node:path";

export const cicdDir = join(import.meta.dir, "../.."); // cicd/
export const rootDir = join(cicdDir, ".."); // repo root
