import { Router } from 'express';

import { getCustomRepository } from 'typeorm';
import CategoriesRepository from '../repositories/CategoriesRepository';

const categoriesRouter = Router();

categoriesRouter.get('/', async (request, response) => {
  try {
    const categoriesRepository = getCustomRepository(CategoriesRepository);
    return response.json(await categoriesRepository.find());
  } catch (err) {
    return response.status(400).json({ error: err.message });
  }
});

categoriesRouter.post('/', async (request, response) => {
  try {
    const categoriesRepository = getCustomRepository(CategoriesRepository);
    const obj = categoriesRepository.create({
      title: request.body.title,
    });
    await categoriesRepository.save(obj);
    return response.json(obj);
  } catch (err) {
    return response.status(400).json({ error: err.message });
  }
});
export default categoriesRouter;
