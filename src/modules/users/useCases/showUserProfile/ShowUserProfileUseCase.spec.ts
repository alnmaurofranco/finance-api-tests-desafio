import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let usersRepository: InMemoryUsersRepository;
let createUser: CreateUserUseCase;
let showUserProfile: ShowUserProfileUseCase;

describe("Show User Profile UseCase", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    createUser = new CreateUserUseCase(usersRepository);
    showUserProfile = new ShowUserProfileUseCase(usersRepository);
  });

  it("Should be able to show user profile", async () => {
    const { id: user_id } = await createUser.execute({
      email: "johndoe@example.com",
      name: "John Doe",
      password: "123456",
    });

    const result = await showUserProfile.execute(user_id as string);

    expect(result).toHaveProperty("id");
  });

  it("Should not be able to show user profile with an user none existent", async () => {
    expect(async () => {
      await showUserProfile.execute("id-none-existent");
    }).toBeTruthy();
  });
});
