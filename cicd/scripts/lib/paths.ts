import { dirname, resolve } from "node:path";

const libDir = dirname(new URL(import.meta.url).pathname);
export const infraDir = resolve(libDir, "../../infra");
export const rootDir = resolve(libDir, "../../..");
