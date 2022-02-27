import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";

let usersRepository: InMemoryUsersRepository;
let createUser: CreateUserUseCase;
let authenticateUser: AuthenticateUserUseCase;

describe("Authenticate User UseCase", () => {
  beforeEach(async () => {
    usersRepository = new InMemoryUsersRepository();
    createUser = new CreateUserUseCase(usersRepository);
    authenticateUser = new AuthenticateUserUseCase(usersRepository);

    await createUser.execute({
      email: "johndoe@example.com",
      name: "John Doe",
      password: "123456",
    });
  });

  it("Should be able to authenticate user", async () => {
    const result = await authenticateUser.execute({
      email: "johndoe@example.com",
      password: "123456",
    });

    expect(result).toEqual(
      expect.objectContaining({
        token: expect.any(String),
      })
    );
    expect(result.user).toHaveProperty("id");
  });

  it("Should not be able to authenticate user with invalid email", async () => {
    expect(async () => {
      await authenticateUser.execute({
        email: "admin@example.com",
        password: "123456",
      });
    }).toBeTruthy();
  });

  it("Should not be able to authenticate user with invalid password", async () => {
    expect(async () => {
      await authenticateUser.execute({
        email: "johndoe@example.com",
        password: "",
      });
    }).toBeTruthy();
  });
});
