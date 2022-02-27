import request from "supertest";
import { v4 as uuidV4 } from "uuid";
import { hash } from "bcryptjs";
import { Connection, createConnection } from "typeorm";
import { app } from "../../../../app";

let connection: Connection;

describe("Get Balance Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const id = uuidV4();
    const passsword = await hash("123456", 8);

    await connection.query(
      `INSERT INTO users (id, name, email, password, created_at, updated_at)
            VALUES ('${id}', 'John Doe', 'johndoe@example.com', '${passsword}', now(), now())`
    );
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to get a balance", async () => {
    const responseUser = await request(app).post("/api/v1/sessions").send({
      email: "johndoe@example.com",
      password: "123456",
    });

    const { token } = responseUser.body;

    await request(app)
      .post("/api/v1/statements/deposit")
      .set({
        Authorization: `Bearer ${token}`,
      })
      .send({
        amount: 100,
        description: "Salary",
      });

    const response = await request(app)
      .get("/api/v1/statements/balance")
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(200);
    expect(response.body.balance).toBe(100);
    expect(response.body).toHaveProperty("balance");
    expect(response.body).toHaveProperty("statement");
  });

  it("should not be able to get a balance a nonexistent user", async () => {
    const responseUser = await request(app).post("/api/v1/sessions").send({
      email: "johndoe@example.com",
      password: "123456",
    });

    const { token, user } = responseUser.body;

    await connection.query(`DELETE FROM users WHERE id = '${user.id}'`);

    const response = await request(app)
      .get("/api/v1/statements/balance")
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(404);
  });
});
