import { Router } from 'express';

import { getCustomRepository } from 'typeorm';
import multer from 'multer';
import AppError from '../errors/AppError';
import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();
const upload = multer();
transactionsRouter.get('/', async (request, response) => {
  try {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const balance = await transactionsRepository.getBalance();
    const obj = {
      transactions: await transactionsRepository.find(),
      balance,
    };
    return response.json(obj);
  } catch (err) {
    return new AppError(err.message, 400);
  }
});

transactionsRouter.post('/', async (request, response) => {
  try {
    const createTransactionService = new CreateTransactionService();
    const obj = await createTransactionService.execute({
      title: request.body.title,
      type: request.body.type,
      value: request.body.value,
      category: request.body.category,
    });

    return response.json(obj);
  } catch (err) {
    throw new AppError(err.message, 400);
  }
});

transactionsRouter.delete('/:id', async (request, response) => {
  try {
    const deleteTransactionService = new DeleteTransactionService();
    const { id } = request.params;
    await deleteTransactionService.execute({ id });
    return response.send();
  } catch (err) {
    throw new AppError(err.message, 400);
  }
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    const importTransactionsService = new ImportTransactionsService();
    const { file } = request;
    await importTransactionsService.execute({ file });
    return response.send();
  },
);

export default transactionsRouter;
