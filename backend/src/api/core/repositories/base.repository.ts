import { Prisma } from '@services/prisma.service';

export abstract class BaseRepository<T, K = string> {
  protected prisma = Prisma.client;
  protected abstract get model(): any;

  async create(data: Partial<T>): Promise<T> {
    return await this.model.create({ data });
  }

  async findById(id: K): Promise<T | null> {
    return await this.model.findUnique({ where: { id } });
  }

  async update(id: K, data: Partial<T>): Promise<T> {
    return await this.model.update({ where: { id }, data });
  }

  async delete(id: K): Promise<void> {
    await this.model.delete({ where: { id } });
  }

  async findAll(): Promise<T[]> {
    return await this.model.findMany();
  }

  async count(): Promise<number> {
    return await this.model.count();
  }
}
