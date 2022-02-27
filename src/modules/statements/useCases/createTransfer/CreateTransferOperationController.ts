import { Request, Response } from "express";
import { container } from "tsyringe";
import { CreateTransferOperationUseCase } from "./CreateTransferOperationUseCase";

class CreateTransferOperationController {
  async handle(request: Request, response: Response): Promise<Response> {
    try {
      const { id } = request.user;
      const { amount, description } = request.body;
      const { receiver_id } = request.params;

      const createTransferOperation = container.resolve(
        CreateTransferOperationUseCase
      );

      const result = await createTransferOperation.execute({
        receiver_id,
        sender_id: id,
        amount,
        description,
      });

      return response.json(result);
    } catch (error: any) {
      return response.status(400).json({ err: error.message });
    }
  }
}

export { CreateTransferOperationController };
