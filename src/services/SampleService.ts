// src/services/SampleService.ts

import { injectable } from 'inversify';
import { SampleModel } from '../models/SampleModel';

@injectable()
class SampleService {
  async getAll(): Promise<SampleModel[]> {
    return SampleModel.findAll();
  }

  async getById(id: number): Promise<SampleModel | null> {
    return SampleModel.findByPk(id);
  }

  async create(name: string): Promise<SampleModel> {
    return SampleModel.create({ name });
  }
}

export { SampleService };
