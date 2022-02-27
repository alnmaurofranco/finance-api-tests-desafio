import Request from "supertest";
import { Connection, createConnection } from "typeorm";
import { app } from "../../../../app";
import { v4 as uuid } from "uuid";
import { hash } from "bcryptjs";

let connection: Connection;

describe("Authenticate User Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const id = uuid();
    const passsword = await hash("12345", 8);

    await connection.query(
      `INSERT INTO users (id, name, email, password, created_at, updated_at)
            VALUES ('${id}', 'John Doe', 'johndoe@example.com', '${passsword}', now(), now())`
    );
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to authenticate a user", async () => {
    const response = await Request(app).post("/api/v1/sessions").send({
      email: "johndoe@example.com",
      password: "12345",
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
    expect(response.body.user).toHaveProperty("id");
    expect(response.body).toEqual(
      expect.objectContaining({
        user: expect.objectContaining({
          id: expect.any(String),
          name: response.body.user.name,
          email: response.body.user.email,
        }),
        token: expect.any(String),
      })
    );
  });

  it("should not be able to authenticate with incorrect password", async () => {
    const response = await Request(app).post("/api/v1/sessions").send({
      email: "johndoe@example.com",
      password: "",
    });

    expect(response.status).toBe(401);
  });

  it("should not be able to authenticate with non-existent user", async () => {
    const response = await Request(app).post("/api/v1/sessions").send({
      email: "doejohn@testexample.com",
      password: "12345",
    });

    expect(response.status).toBe(401);
  });
});
