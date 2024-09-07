import { ITransactionManager } from "Application/shared/ITransactionManager";
import { PrismaClientManager } from "./PrismaClientManager";
import prisma from "./prismaClient";
import { inject, injectable } from "tsyringe";

@injectable()
export class PrismaTransactionManager implements ITransactionManager {
  constructor(
    @inject("IDataAccessClientManager")
    private clientManager: PrismaClientManager
  ) {}

  async begin<T>(callback: () => Promise<T>): Promise<T | undefined> {
    return await prisma.$transaction(async (transaction) => {
      this.clientManager.setClient(transaction);

      const res = await callback();

      this.clientManager.setClient(prisma);

      return res;
    });
  }
}
