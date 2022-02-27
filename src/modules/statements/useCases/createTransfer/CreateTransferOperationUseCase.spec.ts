import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { OperationType } from "modules/statements/entities/Statement";
import { CreateTransferOperationUseCase } from "./CreateTransferOperationUseCase";

let statementsRepository: InMemoryStatementsRepository;
let usersRepository: InMemoryUsersRepository;
let createStatement: CreateStatementUseCase;
let createTransferOperation: CreateTransferOperationUseCase;

describe("Create Transfer Operation Use Case", () => {
  beforeEach(() => {
    statementsRepository = new InMemoryStatementsRepository();
    usersRepository = new InMemoryUsersRepository();
    createStatement = new CreateStatementUseCase(
      usersRepository,
      statementsRepository
    );
    createTransferOperation = new CreateTransferOperationUseCase(
      usersRepository,
      statementsRepository
    );
  });

  it("should be able to create a transfer operation", async () => {
    const sender = await usersRepository.create({
      email: "johndoe@example.com",
      name: "John Doe",
      password: "123456",
    });

    const receiver = await usersRepository.create({
      email: "doejohn@example.com",
      name: "Doe John",
      password: "12345",
    });

    await createStatement.execute({
      user_id: sender.id as string,
      amount: 2000,
      description: "Trust fund",
      type: "deposit" as OperationType,
    });

    const result = await createTransferOperation.execute({
      amount: 1000,
      description: "Transfer",
      receiver_id: receiver.id as string,
      sender_id: sender.id as string,
    });

    expect(result.amount).toBe(1000);
    expect(result.description).toBe("Transfer");
    expect(result).toHaveProperty("type", "transfer");
    expect(result).toHaveProperty("sender_id", sender.id);
    expect(result).toHaveProperty("user_id", receiver.id);
  });

  it("should not able to create a transfer operation if the sender does not exists", async () => {
    expect(async () => {
      const receiver = await usersRepository.create({
        email: "doejohn@example.com",
        name: "Doe John",
        password: "12345",
      });

      await createTransferOperation.execute({
        amount: 1000,
        description: "Transfer",
        receiver_id: receiver.id as string,
        sender_id: "sender-id-non-existent",
      });
    }).toBeTruthy();
  });

  it("should not able to create a transfer operation if the receiver does not exists", () => {
    expect(async () => {
      const sender = await usersRepository.create({
        email: "johndoe@example.com",
        name: "John Doe",
        password: "123456",
      });

      await createTransferOperation.execute({
        amount: 1000,
        description: "Transfer",
        receiver_id: "receiver-id-non-existent",
        sender_id: sender.id as string,
      });
    }).toBeTruthy();
  });
});
