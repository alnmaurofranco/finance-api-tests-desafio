import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "./CreateStatementUseCase";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { OperationType } from "../../entities/Statement";

let statementsRepository: InMemoryStatementsRepository;
let usersRepository: InMemoryUsersRepository;
let createStatement: CreateStatementUseCase;

describe("Create Statement UseCase", () => {
  beforeEach(() => {
    statementsRepository = new InMemoryStatementsRepository();
    usersRepository = new InMemoryUsersRepository();
    createStatement = new CreateStatementUseCase(
      usersRepository,
      statementsRepository
    );
  });

  it("Should be able to create a new statement", async () => {
    const user = await usersRepository.create({
      email: "johndoe@example.com",
      name: "John Doe",
      password: "123456",
    });

    const result = await createStatement.execute({
      user_id: user.id as string,
      amount: 2000,
      description: "Trust fund",
      type: "deposit" as OperationType,
    });

    expect(result).toHaveProperty("user_id");
    expect(result).toEqual(
      expect.objectContaining({
        id: result.id,
        user_id: user.id,
        amount: expect.any(Number),
        description: expect.any(String),
      })
    );
  });

  it("Should not be able to create a new statement with user does not exists", async () => {
    expect(async () => {
      await createStatement.execute({
        user_id: "non-existent",
        amount: 100,
        description: "Thirteen first salary",
        type: "deposit" as OperationType,
      });
    }).toBeTruthy();
  });

  it("Should not be able to create a new statement with insufficient funds", async () => {
    expect(async () => {
      const user = await usersRepository.create({
        email: "johndoe@example.com",
        name: "John Doe",
        password: "123456",
      });

      await createStatement.execute({
        user_id: user.id as string,
        amount: 500,
        description: "Trust fund initial",
        type: "deposit" as OperationType,
      });

      await createStatement.execute({
        user_id: user.id as string,
        amount: 600,
        description: "Rental payment",
        type: "withdraw" as OperationType,
      });
    }).toBeTruthy();
  });
});
