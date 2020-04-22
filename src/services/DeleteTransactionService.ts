import { getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  id: string;
}
class DeleteTransactionService {
  public async execute({ id }: Request): Promise<void> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const alreadyExistCategory = await transactionsRepository.findOne(id);

    if (alreadyExistCategory)
      await transactionsRepository.remove(alreadyExistCategory);
    else throw new AppError('Transaction does not exist', 400);
  }
}

export default DeleteTransactionService;
