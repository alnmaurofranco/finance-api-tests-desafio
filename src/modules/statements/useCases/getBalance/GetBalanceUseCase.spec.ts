import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetBalanceUseCase } from "./GetBalanceUseCase";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";

let usersRepository: InMemoryUsersRepository;
let statementsRepository: InMemoryStatementsRepository;
let createUser: CreateUserUseCase;
let getBalance: GetBalanceUseCase;

describe("Get Balance UseCase", () => {
  beforeEach(() => {
    statementsRepository = new InMemoryStatementsRepository();
    usersRepository = new InMemoryUsersRepository();
    createUser = new CreateUserUseCase(usersRepository);
    getBalance = new GetBalanceUseCase(statementsRepository, usersRepository);
  });

  it("Should be able to get balance of user", async () => {
    const user = await createUser.execute({
      email: "johndoe@example.com",
      name: "John Doe",
      password: "123456",
    });

    const result = await getBalance.execute({ user_id: user.id as string });

    expect(result).toHaveProperty("balance");
    expect(result).toEqual(
      expect.objectContaining({
        balance: expect.any(Number),
        statement: expect.any(Array),
      })
    );
  });

  it("Should be able to get balance with user does not exists", async () => {
    expect(async () => {
      await getBalance.execute({ user_id: "invalid-id" });
    }).toBeTruthy();
  });
});
