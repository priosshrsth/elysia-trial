import type { ElysiaOpenAPIConfig } from "@elysiajs/openapi";
import type { Path } from "better-auth/plugins";
import { auth } from "./auth";

type IConfig = Required<ElysiaOpenAPIConfig>["documentation"];
let schema: Awaited<ReturnType<typeof auth.api.generateOpenAPISchema>>;
const getSchema = async () => {
  if (schema) {
    return schema;
  }
  schema = await auth.api.generateOpenAPISchema();
  return schema;
};

export const AuthOpenApi = {
  getPaths: (prefix = "/api/auth") =>
    getSchema().then(({ paths }) => {
      const reference: typeof paths = Object.create(null);

      for (const path of Object.keys(paths)) {
        const key = prefix + path;
        reference[key] = paths[path];

        for (const method of Object.keys(paths[path])) {
          const operation = (reference[key] as unknown as Required<Path>)[method as keyof Path];

          operation.tags = ["Better Auth"];
        }
      }

      return reference;
    }) as Promise<IConfig["paths"]>,
  componets: getSchema().then(({ components }) => components) as Promise<IConfig["components"]>,
  getSecurity: getSchema().then(({ security }) => security) as Promise<IConfig["security"]>,
};
