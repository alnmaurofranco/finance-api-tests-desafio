import Request from "supertest";
import { Connection, createConnection } from "typeorm";
import { app } from "../../../../app";
import { v4 as uuid } from "uuid";
import { hash } from "bcryptjs";

let connection: Connection;

describe("Create User Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to create a new user", async () => {
    const response = await Request(app).post("/api/v1/users").send({
      name: "John Doe",
      email: "johndoe@example.com",
      password: "12345",
    });

    console.log(response.body);

    expect(response.status).toBe(201);
  });

  it("should not be able to create a new user with email exists", async () => {
    const response = await Request(app).post("/api/v1/users").send({
      name: "John Doe",
      email: "johndoe@example.com",
      password: "12345",
    });

    expect(response.status).toBe(400);
  });
});
