import Request from "supertest";
import { Connection, createConnection } from "typeorm";
import { app } from "../../../../app";
import { v4 as uuid } from "uuid";
import { hash } from "bcryptjs";

let connection: Connection;

describe("Create Statement Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
    const id = uuid();
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

  it("should be able to create statement", async () => {
    const responseUser = await Request(app).post("/api/v1/sessions").send({
      email: "johndoe@example.com",
      password: "123456",
    });

    const { token, user } = responseUser.body;

    const response = await Request(app)
      .post("/api/v1/statements/deposit")
      .set({
        Authorization: `Bearer ${token}`,
      })
      .send({
        amount: 100,
        description: "Salary",
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.amount).toBe(100);
    expect(response.body.description).toBe("Salary");
    expect(response.body.user_id).toBe(user.id);
  });

  it("should be able to create a withdraw", async () => {
    const responseUser = await Request(app).post("/api/v1/sessions").send({
      email: "johndoe@example.com",
      password: "123456",
    });

    const { token, user } = responseUser.body;

    const response = await Request(app)
      .post("/api/v1/statements/withdraw")
      .set({
        Authorization: `Bearer ${token}`,
      })
      .send({
        amount: 50,
        description: "investiment",
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("user_id", user.id);
    expect(response.body).toHaveProperty("type", "withdraw");
    expect(response.body.amount).toBe(50);
    expect(response.body.description).toBe("investiment");
  });

  it("should not be able to create a withdraw with insufficient funds", async () => {
    const responseUser = await Request(app).post("/api/v1/sessions").send({
      email: "johndoe@example.com",
      password: "123456",
    });

    const { token } = responseUser.body;

    const response = await Request(app)
      .post("/api/v1/statements/withdraw")
      .set({
        Authorization: `Bearer ${token}`,
      })
      .send({
        amount: 200,
        description: "extra money",
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Insufficient funds");
  });

  it("should not be able to create statement with user non-existent", async () => {
    const responseUser = await Request(app).post("/api/v1/sessions").send({
      email: "johndoe@example.com",
      password: "123456",
    });

    const { token, user } = responseUser.body;

    await connection.query(`DELETE FROM users WHERE id = '${user.id}'`);

    const response = await Request(app)
      .post("/api/v1/statements/deposit")
      .set({
        Authorization: `Bearer ${token}`,
      })
      .send({
        amount: 100,
        description: "Salary",
      });

    expect(response.status).toBe(404);
  });
});
