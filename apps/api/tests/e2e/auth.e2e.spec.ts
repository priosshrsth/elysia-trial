import { treaty } from "@elysiajs/eden";
import { app } from "src/main";

describe("Better Auth Integration", () => {
  const client = treaty(app, {
    fetch: {
      credentials: "include",
      mode: "cors",
    },
  });
  it("Scenario 1: Register a new user fails with invalid data", async () => {
    const response = await client.api.v1.auth["sign-up"].email.post({
      email: "",
      name: "",
      password: "",
    });
    console.log({ data: response.error?.value, status: response.error?.status });
    expect(response.status).toBe(400);
    expect(response.error?.value).toContainKey("code");
    if (response.error?.value && "code" in response.error.value) {
      expect(response.error?.value?.code).toBe("VALIDATION_ERROR");
    }
  });

  it("Scenario 1: Register a new user", async () => {
    const response = await client.api.v1.auth["sign-up"].email.post({
      email: "john@example.com",
      password: "Secret@123",
      name: "John Doe",
    });
    expect(response.status).toBe(200);
  });
});
