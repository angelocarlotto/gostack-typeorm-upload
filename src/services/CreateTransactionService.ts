// import AppError from '../errors/AppError';
import { getCustomRepository } from 'typeorm';
import TransactionsRepository from '../repositories/TransactionsRepository';
import CategoriesRepository from '../repositories/CategoriesRepository';
import Transaction from '../models/Transaction';

interface Request {
  type: 'income' | 'outcome';
  value: number;
  title: string;
  category: string;
}

class CreateTransactionService {
  public async execute({
    type,
    value,
    title,
    category,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoriesRepository = getCustomRepository(CategoriesRepository);

    const { income, outcome } = await transactionsRepository.getBalance();

    if (type === 'outcome' && income - outcome < value) {
      throw Error('sorry, dude. you do not have anouthg saldo');
    }

    const alreadyExistCategory = await categoriesRepository.findOne({
      where: { title: category },
    });

    if (!alreadyExistCategory) {
      const newCategory = categoriesRepository.create({ title: category });

      await categoriesRepository.save(newCategory);
      const obj = transactionsRepository.create({
        title,
        type,
        value,
        category_id: newCategory.id,
      });

      await transactionsRepository.save(obj);
      return obj;
    }
    const obj = transactionsRepository.create({
      title,
      type,
      value,
      category_id: alreadyExistCategory.id,
    });
    await transactionsRepository.save(obj);
    return obj;
  }
}

export default CreateTransactionService;
