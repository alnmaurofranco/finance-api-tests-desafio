import Request from "supertest";
import { Connection, createConnection } from "typeorm";
import { app } from "../../../../app";

let connection: Connection;

describe("Show User Profile Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to show a profile user", async () => {
    await Request(app).post("/api/v1/users").send({
      name: "John Doe",
      email: "johndoe@example.com",
      password: "123456",
    });

    const responseUser = await Request(app).post("/api/v1/sessions").send({
      email: "johndoe@example.com",
      password: "123456",
    });

    const { token, user } = responseUser.body;

    const response = await Request(app)
      .get("/api/v1/profile")
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id");
    expect(response.body.name).toEqual(user.name);
    expect(response.body.email).toEqual(user.email);
    expect(response.body.id).toBe(user.id);
  });

  it("should not be able to show a profile with user non-existent", async () => {
    await Request(app).post("/api/v1/users").send({
      name: "Doe John",
      email: "doejohn@example.com",
      password: "12345",
    });

    const responseUser = await Request(app).post("/api/v1/sessions").send({
      email: "doejohn@example.com",
      password: "12345",
    });

    const { token, user } = responseUser.body;

    await connection.query(`DELETE FROM users WHERE id = '${user.id}'`);

    const response = await Request(app)
      .get("/api/v1/profile")
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(404);
  });

  it("should not be able to show a profile user without a token", async () => {
    const response = await Request(app).get("/api/v1/profile");

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("JWT token is missing!");
  });
});
