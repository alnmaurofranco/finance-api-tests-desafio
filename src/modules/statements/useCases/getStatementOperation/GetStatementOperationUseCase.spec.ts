import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";
import { OperationType } from "../../entities/Statement";

let usersRepository: InMemoryUsersRepository;
let statementsRepository: InMemoryStatementsRepository;
let getStatementOperation: GetStatementOperationUseCase;

describe("Get Statement Operation UseCase", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    statementsRepository = new InMemoryStatementsRepository();
    getStatementOperation = new GetStatementOperationUseCase(
      usersRepository,
      statementsRepository
    );
  });

  it("Should be able to get statemnet operation by user", async () => {
    const user = await usersRepository.create({
      name: "John Doe",
      email: "johndoe@example.com",
      password: "123456",
    });

    const statement = await statementsRepository.create({
      user_id: user.id as string,
      amount: 1000,
      description: "Deposit in account",
      type: "deposit" as OperationType,
    });

    const result = await getStatementOperation.execute({
      user_id: user.id as string,
      statement_id: statement.id as string,
    });

    expect(result).toHaveProperty("user_id");
    expect(result).toHaveProperty("amount");
  });

  it("Should not be able to get statement operation with user does not exists", async () => {
    expect(async () => {
      const statement = await statementsRepository.create({
        user_id: "non-existent",
        amount: 1000,
        description: "Deposit in account",
        type: "deposit" as OperationType,
      });

      await getStatementOperation.execute({
        user_id: "non-existent-user",
        statement_id: statement.id as string,
      });
    }).toBeTruthy();
  });

  it("Should not be able to get statement operation with statement does not exists", async () => {
    expect(async () => {
      const user = await usersRepository.create({
        name: "John Doe",
        email: "johndoe@example.com",
        password: "123456",
      });

      await getStatementOperation.execute({
        user_id: user.id as string,
        statement_id: "no-existent-statement",
      });
    }).toBeTruthy();
  });
});
