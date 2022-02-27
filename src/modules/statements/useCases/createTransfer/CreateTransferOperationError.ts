import { AppError } from "../../../../shared/errors/AppError";

namespace CreateTransferOperationError {
  export class UserSenderNotFound extends AppError {
    constructor() {
      super("Sender does not exists.");
    }
  }

  export class UserReceiverNotFound extends AppError {
    constructor() {
      super("Receiver does not exists.");
    }
  }

  export class InsufficientFunds extends AppError {
    constructor() {
      super("You they're Insufficient Funds");
    }
  }
}

export { CreateTransferOperationError };
