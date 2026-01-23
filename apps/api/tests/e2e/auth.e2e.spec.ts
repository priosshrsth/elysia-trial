import { treaty } from "@elysiajs/eden";
import { app } from "src/main";

describe("Better Auth Integration", () => {
  const client = treaty(app);
  it("Scenario 1: Register a new user fails with invalid data", async () => {
    const response = await client.register.post({
      email: "",
      password: "",
      name: "",
    });

    expect(response.status).toBe(400);
  });

  it("Scenario 1: Register a new user", async () => {
    const response = await client.register.post({
      email: "john@example.com",
      password: "Secret@123",
      name: "John Doe",
    });
    expect(response.status).toBe(200);
  });
});
