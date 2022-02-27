import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "./CreateUserUseCase";

let usersRepository: InMemoryUsersRepository;
let createUser: CreateUserUseCase;

describe("Create User UseCase", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    createUser = new CreateUserUseCase(usersRepository);
  });

  it("Should be able to create a new user", async () => {
    const result = await createUser.execute({
      email: "johndoe@example.com",
      name: "John Doe",
      password: "123456",
    });

    expect(result).toHaveProperty("id");
    expect(result).toMatchObject({
      id: expect.any(String),
      email: "johndoe@example.com",
      name: "John Doe",
    });
  });

  it("Should not be able to create a new user with email the user existent", async () => {
    expect(async () => {
      await createUser.execute({
        email: "johndoe@example.com",
        name: "Doehn",
        password: "1234",
      });

      await createUser.execute({
        email: "johndoe@example.com",
        name: "John Doe",
        password: "123456",
      });
    }).toBeTruthy();
  });
});
