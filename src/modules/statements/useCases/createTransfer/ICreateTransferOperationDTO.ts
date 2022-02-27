type ICreateTransferOperationDTO = {
  sender_id: string;
  receiver_id: string;
  amount: number;
  description: string;
};

export { ICreateTransferOperationDTO };
