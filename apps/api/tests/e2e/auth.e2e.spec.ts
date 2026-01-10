import { app } from "src/app";

describe("Better Auth Integration", () => {
  it("Scenario 1: Register a new user fails with invalid data", async () => {
    const response = await app.handle(
      new Request("http://localhost:3001/api/auth/sign-up/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({}),
      }),
    );

    const data = await response.json();
    data.expect(response.status).toBe(400);
  });

  it("Scenario 1: Register a new user", async () => {
    const response = await app.handle(
      new Request("http://localhost:3001/api/auth/sign-up/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: "john@example.com",
          name: "John Doe",
          password: "Secret@123",
        }),
      }),
    );
    expect(response.status).toBe(200);
  });
});
