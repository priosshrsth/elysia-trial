import { AuthOpenApi } from "./apps/api/src/lib/auth/auth.openapi";

async function verify() {
  const components = await AuthOpenApi.components;
  console.log("Security Schemes:", JSON.stringify(components?.securitySchemes, null, 2));

  const paths = await AuthOpenApi.getPaths();
  // Check the first path's first method for security
  const firstPathKey = Object.keys(paths)[0];
  if (firstPathKey) {
    const methods = paths[firstPathKey];
    const firstMethod = Object.keys(methods)[0];
    if (firstMethod) {
      // @ts-expect-error
      console.log(
        `Security for ${firstPathKey} [${firstMethod}]:`,
        JSON.stringify(methods[firstMethod].security, null, 2)
      );
    }
  }
}

verify();
