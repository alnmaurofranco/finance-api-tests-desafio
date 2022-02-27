import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { injectable, inject } from "tsyringe";
import { ICreateTransferOperationDTO } from "./ICreateTransferOperationDTO";
import { CreateTransferOperationError } from "./CreateTransferOperationError";
import { OperationType, Statement } from "../../entities/Statement";

type CreateTransferOperationUseCaseResponse = Statement;

@injectable()
class CreateTransferOperationUseCase {
  constructor(
    @inject("UsersRepository")
    private usersRepository: IUsersRepository,

    @inject("StatementsRepository")
    private statementsRepository: IStatementsRepository
  ) {}

  async execute({
    amount,
    description,
    receiver_id,
    sender_id,
  }: ICreateTransferOperationDTO): Promise<CreateTransferOperationUseCaseResponse> {
    const senderAlreadyExists = await this.usersRepository.findById(sender_id);

    if (!senderAlreadyExists) {
      throw new CreateTransferOperationError.UserSenderNotFound();
    }

    const receiverAlreadyExists = await this.usersRepository.findById(
      receiver_id
    );

    if (!receiverAlreadyExists) {
      throw new CreateTransferOperationError.UserReceiverNotFound();
    }

    const { balance } = await this.statementsRepository.getUserBalance({
      user_id: senderAlreadyExists.id as string,
    });

    if (amount > balance) {
      throw new CreateTransferOperationError.InsufficientFunds();
    }

    await this.statementsRepository.create({
      user_id: senderAlreadyExists.id as string,
      type: OperationType.WITHDRAW,
      amount,
      description: `Transferência para ${receiverAlreadyExists.name}: ${description}`,
    });

    const transferOperation = await this.statementsRepository.create({
      user_id: receiverAlreadyExists.id as string,
      sender_id: senderAlreadyExists.id as string,
      type: OperationType.TRANSFER,
      amount,
      description,
    });

    return transferOperation;
  }
}

export { CreateTransferOperationUseCase };
