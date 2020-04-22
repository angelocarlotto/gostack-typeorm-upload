import csvParse from 'csv-parse';
import streamifier from 'streamifier';
import { getCustomRepository, In } from 'typeorm';
import TransactionRepository from '../repositories/TransactionsRepository';
import Transaction from '../models/Transaction';
import CategoriesRepository from '../repositories/CategoriesRepository';

async function loadCSV(file: Express.Multer.File): Promise<TransactionCsv[]> {
  const readCSVStream = streamifier.createReadStream(file.buffer);
  const parseStream = csvParse({
    delimiter: ',',
    columns: true,
    trim: true,
  });

  const parseCSV = readCSVStream.pipe(parseStream);

  const lines: TransactionCsv[] = [];

  parseCSV.on('data', (line: TransactionCsv) => {
    lines.push({
      category: line.category,
      title: line.title,
      type: line.type,
      value: line.value,
    });
  });

  await new Promise(resolve => {
    parseCSV.on('end', resolve);
  });

  return lines;
}

interface Request {
  file: Express.Multer.File;
}
interface TransactionCsv {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class ImportTransactionsService {
  async execute({ file }: Request): Promise<Transaction[]> {
    const transactionsRepository = getCustomRepository(TransactionRepository);
    const categoriesRepository = getCustomRepository(CategoriesRepository);

    const data = await loadCSV(file);

    const listCategory = data.map(a => a.category);

    const newC = categoriesRepository.create({ title: 'Others' });
    await categoriesRepository.save(newC);
    const listaCategoriaExistentes = await categoriesRepository.find({
      where: In(listCategory),
    });

    const listaUnica = listCategory
      .filter(e => !listaCategoriaExistentes.find(f => f.title === e))
      .filter((value, index, self) => self.indexOf(value) === index);

    const newCategories = categoriesRepository.create(
      listaUnica.map(e => ({
        title: e,
      })),
    );

    await categoriesRepository.save(newCategories);

    const finalCategories = [...listaCategoriaExistentes, ...newCategories];

    const transacations = transactionsRepository.create(
      data.map(e => ({
        value: e.value,
        title: e.title,
        type: e.type,
        category: finalCategories.find(f => f.title === e.category),
      })),
    );

    await transactionsRepository.save(transacations);

    return transacations;
  }
}

export default ImportTransactionsService;
