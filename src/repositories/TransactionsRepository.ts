import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find({ select: ['type', 'value'] });
    const income = transactions.reduce(
      (a, b) => a + (b.type === 'income' ? Number(b.value) : 0),
      0,
    );
    const outcome = transactions.reduce(
      (a, b) => a + (b.type === 'outcome' ? Number(b.value) : 0),
      0,
    );
    return { income, outcome, total: income - outcome };
  }
}

export default TransactionsRepository;
