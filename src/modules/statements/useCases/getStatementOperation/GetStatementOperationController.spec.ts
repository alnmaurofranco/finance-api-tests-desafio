import request from "supertest";
import { v4 as uuid } from "uuid";
import { hash } from "bcryptjs";
import { Connection, createConnection } from "typeorm";
import { app } from "../../../../app";

let connection: Connection;

describe("Get Statement Operation Controller", () => {
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

  it("should be able to get a statement operation", async () => {
    const responseUser = await request(app).post("/api/v1/sessions").send({
      email: "johndoe@example.com",
      password: "123456",
    });

    const { token } = responseUser.body;

    const statementResponse = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 100,
        description: "Salary",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const { id, user_id, amount, description, type } = statementResponse.body;

    const response = await request(app)
      .get(`/api/v1/statements/${id}`)
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(200);
    expect(response.body.amount).toBe(amount.toFixed(2));
    expect(response.body).toHaveProperty("id", id);
    expect(response.body).toHaveProperty("user_id", user_id);
    expect(response.body).toHaveProperty("description", description);
    expect(response.body).toHaveProperty("type", type);
  });

  it("should not be able to get a nonexistent statement operation", async () => {
    const responseUser = await request(app).post("/api/v1/sessions").send({
      email: "johndoe@example.com",
      password: "123456",
    });

    const { token } = responseUser.body;

    const fakeId = uuid();

    const response = await request(app)
      .get(`/api/v1/statements/${fakeId}`)
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(404);
  });

  it("should be able to get a statement operation from nonexistent user", async () => {
    const responseUser = await request(app).post("/api/v1/sessions").send({
      email: "johndoe@example.com",
      password: "123456",
    });

    const { token, user } = responseUser.body;

    const statementResponse = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 100,
        description: "extra salary",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const { id } = statementResponse.body;

    await connection.query(`DELETE FROM users WHERE id = '${user.id}'`);

    const response = await request(app)
      .get(`/api/v1/statements/${id}`)
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(404);
  });
});
